const app = require('./app')

const PORT = process.env.PORT
const PUBLIC_DIR = process.env.PUBLIC_DIR || 'public'
const KEY_FILE = process.env.KEY_FILE
const CERT_FILE = process.env.CERT_FILE

const server = app(PUBLIC_DIR, KEY_FILE, CERT_FILE)
server.listen(PORT)
