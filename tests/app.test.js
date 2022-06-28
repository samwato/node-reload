const http2 = require('http2')
const path = require('path')
const fs = require('fs')
const app = require('../app')

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP_STATUS_ACCEPTED,
  HTTP2_HEADER_CONTENT_TYPE,
} = http2.constants

const TEST_PORT = 8443
const TEST_URL = `https://localhost:${TEST_PORT}`
const PUBLIC_DIR = path.resolve(__dirname, '../examples/dev_public_dir')
const KEY_FILE = path.resolve(__dirname, '../certs/localhost-key.pem')
const CERT_FILE = path.resolve(__dirname, '../certs/localhost-cert.pem')

const server = app(PUBLIC_DIR, KEY_FILE, CERT_FILE)

describe('Server', () => {
  beforeAll(() => {
    server.listen(TEST_PORT)
  })

  afterAll(() => {
    server.close()
  })

  test('base route return index.html file', (done) => {
    const client = http2.connect(TEST_URL, {
      ca: fs.readFileSync(CERT_FILE)
    })

    client.request({ [HTTP2_HEADER_PATH]: '/' })
      .on('response', (headers) => {
        expect(headers[HTTP2_HEADER_STATUS]).toBe(HTTP_STATUS_ACCEPTED)
        expect(headers[HTTP2_HEADER_CONTENT_TYPE]).toBe('text/html')
      })
      .on('end', () => {
        client.close()
        done()
      })
      .end()
  })

  // test('unknown file path returns 404', (done) => {
  //   http.get(`${TEST_URL}/somethingnotthere`, (res) => {
  //     expect(res.statusCode).toBe(404)
  //     expect(res.statusMessage).toBe('Not Found')
  //     res.resume()
  //   }).end(() => {
  //     done()
  //   })
  // })
  //
  // test('http/2 can send push', () => {
  //   http.request(TEST_URL, {
  //     headers: {
  //       'ms'
  //       'Connection': 'Upgrade',
  //       'Upgrade': 'websocket',
  //     }
  //   })
  //
  // })
  //
  // test('http/2 can trigger browser refresh', () => {
  //
  // })
})