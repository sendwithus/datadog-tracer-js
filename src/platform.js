'use strict'

const http = require('http')
const now = require('performance-now')
const Long = require('long')
const loadNs = now()
const loadMs = Date.now()

module.exports = {
  now () {
    return Math.round((loadMs + now() - loadNs) * 100000) / 100000
  },

  id () {
    return new Long(random(), random(), true)
  },

  request (options) {
    options = Object.assign({
      headers: {}
    }, options)

    options.headers['Content-Type'] = 'application/json'
    options.headers['Content-Length'] = Buffer.byteLength(options.data || '', 'utf8')

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = ''

        res.setEncoding('utf8')

        res.on('data', (chunk) => {
          body += chunk
        })

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode <= 299) {
            resolve()
          } else {
            const error = new Error(http.STATUS_CODES[res.statusCode])
            error.status = res.statusCode
            error.response = {
              body, headers: res.rawHeaders
            }

            reject(error)
          }
        })
      })

      req.on('error', e => reject(e))

      req.write(options.data)
      req.end()
    })
  }
}

function random () {
  let number = 0

  for (let i = 0; i < 4; i++) {
    number += Math.floor(Math.random() * 255) << (i * 8)
  }

  return number
}
