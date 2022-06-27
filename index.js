const app = require('./app')

const PORT = process.env.PORT
const PUBLIC_DIR = process.env.PUBLIC_DIR || 'public'

const server = app(PUBLIC_DIR)
server.listen(PORT)
