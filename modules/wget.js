/* jslint es6 node:true */
// @ts-check
'use strict'

const wait = require('wait-for-stuff')
const http = require('http')
const https = require('https')

module.exports = class Wget {
  constructor () {
    this.request = require('request')
  }

  data (isHttps, www) {
    const options = {
      url: `http${isHttps ? 's' : ''}://${www}`,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0' }
    }
    const R = this.request
    var P = new Promise(function (resolve, reject) {
      R.get(options, function (error, response, body) {
        if (error) {
          reject(error)
        }
        // Print the response status code if a response was received
        console.log('statusCode:', response && response.statusCode)
        resolve(body)
      })
    })

    return wait.for.promise(P)
  }

  binary (isHttps, www) {
    const options = {
      url: `http${isHttps ? 's' : ''}://${www}`,
      method: 'GET',
      encoding: null
    }
    const R = this.request
    var P = new Promise(function (resolve, reject) {
      R.get(options, function (error, response, body) {
        if (error) {
          reject(error)
        }
        // Print the response status code if a response was received
        console.log('statusCode:', response && response.statusCode)
        resolve(body)
      })
    })

    var response = wait.for.promise(P)
    if (response instanceof Error) {
      throw response
    }
    return response
  }

  favicon (isHttps, www) {
    const re = /<link.*?rel="icon".*?>/g
    const options = {
      hostname: www,
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0' }
    }
    var H
    if (isHttps) {
      H = https
    } else {
      H = http
    }

    var P = new Promise(function (resolve, reject) {
      H.get(options, (resp) => {
        let data = ''
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk
          var e = re.exec(data)
          if (e) {
            var m = e[0].match(/href="(.*?)"/gi)
            resolve(www + m[0].substr(6, m[0].length - 7))
          }
        })

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          resolve(undefined)
        })
      }).on('error', (err) => {
        reject(err)
      })
    })

    var response = wait.for.promise(P)
    if (response instanceof Error) {
      throw response
    }
    return response
  }
}
