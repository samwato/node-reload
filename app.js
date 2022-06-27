const fs = require('fs')
const { createServer } = require('http')
const chokidar = require('chokidar')
const path = require('path')
const { WebSocketServer } = require('ws')

function app(public_dir = 'public') {

  // Create an HTTP server
  const server = createServer((req, res) => {

    // Use request url to match filepath
    let filePath = path.join(
      public_dir,
      req.url,
    )

    // fix root path to index.html
    if (req.url === '/') {
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

    // Serve file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        // respond with appropriate error
        if (err.code === 'ENOENT') {
          res.writeHead(404)
          res.end('Not found')
        } else {
          res.writeHead(500)
          res.end(`Oops, something went wrong: ${err.code}`)
        }
      } else {
        // respond with file
        res.writeHead(200, {
          'Content-Type': contentType,
        })
        res.end(content, 'utf-8')
      }
    })
  })

  server.on('listening', () => {
    console.log('Running node-reload.')
  })


// watching for file changes is only necessary to trigger the websocket refresh
  const watcher = chokidar.watch(public_dir)

// upgrade to websocket
  const wss = new WebSocketServer({ noServer: true })

  wss.on('connection', (socket) => {
    watcher.on('all', () => {
      socket.send('refresh')
    })
  })

// listen to http upgrade from client
  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req) // forward the event
      })
    }
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
