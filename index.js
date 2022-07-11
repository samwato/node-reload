const app = require('./app')

const port = process.env.PORT
const publicDir = process.env.PUBLIC_DIR || 'public'
const keyFile = `certs/${process.env.KEY_FILE}`
const certFile = `certs/${process.env.CERT_FILE}`

const server = app(publicDir, keyFile, certFile)

server.listen(port)
