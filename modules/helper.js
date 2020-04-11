/* jslint es6 node:true */
// @ts-check
'use strict'

module.exports.noty = {}

module.exports.noty.parse = function notyParse (messages, type) {
  var notyMessages = ''
  if (messages !== undefined) {
    messages.forEach(message => {
      notyMessages += `notyAlert('${message}', '${type}');`  
    })
  }
  return notyMessages
}

module.exports.domain = {
  to: {},
  is: {}
}

module.exports.domain.to.backend = function domains2backend (domain) {
  return domain.replace(/\./g, '-')
}

module.exports.domain.is.valid = function domainsIsValid (domain) {
  return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g.test(domain)
}

module.exports.upstream = {
  is: {}
}

module.exports.upstream.is.valid = function upstreamIsValid (upstream) {
  return upstream === upstream.replace(/[^a-z0-9-]/gi, '')
}
