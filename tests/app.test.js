const http = require('http')
const path = require('path')
const app = require('../app')

const TEST_PORT = 4000
const TEST_URL = `http://localhost:${TEST_PORT}`

const server = app(path.resolve(__dirname, '../examples/dev_public_dir'))

describe('Server', () => {
  beforeAll(() => {
    server.listen(TEST_PORT)
  })

  afterAll(() => {
    server.close()
  })

  test('base route return index.html file', (done) => {
    http.get(TEST_URL, (res) => {
      expect(res.statusCode).toBe(200)
      expect(res.headers['content-type']).toBe('text/html')
      res.resume()
    }).end(() => {
      done()
    })
  })

  test('unknown file path returns 404', (done) => {
    http.get(`${TEST_URL}/somethingnotthere`, (res) => {
      expect(res.statusCode).toBe(404)
      expect(res.statusMessage).toBe('Not Found')
      res.resume()
    }).end(() => {
      done()
    })
  })

  test('http/2 can send push', () => {
    http.request(TEST_URL, {
      headers: {
        'm'
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
      }
    })

  })

  test('http/2 can trigger browser refresh', () => {

  })
})