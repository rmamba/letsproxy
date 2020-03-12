/* jslint es6 node:true */
// @ts-check
'use strict'

const wait = require('wait-for-stuff')

module.exports = class Ipify {
  constructor () {
    this.request = require('request')
  }

  ip () {
    var response = wait.for.promise(this.request.get('https://api.ipify.org/?format=json'))
    return response.ip
  }
}
