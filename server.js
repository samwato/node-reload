const fs = require('fs')
const { createServer } = require('http')
const path = require('path')

const PORT = process.env.PORT
const PUBLIC_DIR = process.env.PUBLIC_DIR

// Create an HTTP server
const server = createServer((req, res) => {

  // Use request url to match filepath
  let filePath = './' + PUBLIC_DIR + req.url

  // fix root path to index.html
  if (req.url === '/') {
    filePath += 'index.html'
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
  console.log(`Running dev_server on ${PORT}`)
})

server.listen(PORT)
