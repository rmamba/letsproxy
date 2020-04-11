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
  to: {}
}

module.exports.domain.to.backend = function domains2backend (domain) {
  return domain.replace(/\./g, '-')
}
