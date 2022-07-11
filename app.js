const fs = require('fs')
const http2 = require('http2')
const chokidar = require('chokidar')
const path = require('path')

const {
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE,
  HTTP_STATUS_ACCEPTED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = http2.constants

function app(publicDir = 'public', keyFile, certFile) {

  // Create an HTTP/2 server
  const server = http2.createSecureServer({
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
  });

  // Deal with server errors
  server.on('error', (err) => {
    console.error(err.message)
  })

  server.on('connection', () => {
    console.log('Server has connection ...')
  })

  server.on('session', (session) => {
    session.settings({
      enablePush: true,
    })

    session.on('close', () => {
      console.log('session closed')
    })
  })


  // watching for file changes is only necessary to trigger a browser refresh
  const watcher = chokidar.watch(publicDir)

  watcher.on('ready', () => {
    console.log('watcher ready')

    // Handle requests
    server.on('stream', (stream, headers) => {
      const reqMethod = headers[HTTP2_HEADER_METHOD]
      const reqPath = headers[HTTP2_HEADER_PATH]

      // Use request path to match file path
      let filePath = path.join(
        publicDir,
        reqPath, // TODO
      )

      // fix root path to index.html
      if (reqPath === '/') {
        filePath = path.join(filePath, 'index.html')
      }

      // Match content type
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm',
      }
      const extname = path.extname(filePath).toLowerCase()
      const contentType = mimeTypes[extname] || 'application/octet-stream'

      stream.on('error', (err) => {
        console.log(err.message)
      })

      stream.on('end', () => {
        console.log('stream has ended')
      })

      stream.respondWithFile(filePath,
        {[HTTP2_HEADER_CONTENT_TYPE]: `${contentType}; charset=utf-8`},
        {
          statCheck(stats, headers) {
            headers['last-modified'] = stats.mtime.toUTCString()
          },
          onError(err) {
            try {
              if (err.code === 'ENOENT') {
                stream.respond({
                  [HTTP2_HEADER_STATUS]: HTTP_STATUS_NOT_FOUND,
                })
              } else {
                stream.respond({
                  [HTTP2_HEADER_STATUS]: HTTP_STATUS_INTERNAL_SERVER_ERROR,
                })
              }
            } catch (err) {
              console.log(err)
            }
          }
        })

      if (!stream.pushAllowed) {
        console.log('HTTP/2 client does not allow for push streams')
      } else {
        console.log('HTTP/2 client allows push streams')
        watcher.on('all', (eventName, path) => {
          if (eventName === 'add' || eventName === 'change' || eventName === 'unlink') {
            console.log(`Watcher event: ${eventName} on ${path}`)
            stream.pushStream({ [HTTP2_HEADER_PATH]: '/refresh' }, (err, pushStream) => {
              if (err) {
                console.log(err.message)
              }
              pushStream.on('error', (err) => {
                console.log(err.message)
              })
              pushStream.respond({
                [HTTP2_HEADER_STATUS]: HTTP_STATUS_ACCEPTED,
              })
              pushStream.end('refresh')
            })
          } else {
            console.log(`Watcher event: ${eventName} on ${path} but no refresh`)
          }
        })
      }

    })
  })








// Client side websocket code example
// if (NODE_ENV === 'development') { // Make sure in development mode
//   const ws = new WebSocket(`ws://localhost:${PORT}/ws`)
//   ws.onmessage = ({ data }) => {
//     if (data === 'refresh') {
//       ws.close()
//       window.location.reload()
//     }
//   }
// }

  return server
}

module.exports = app
