/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()
const ConfigLetsproxy = require('../modules/configs/letsproxy')
const Acme = require('../modules/system/acmetool')

router.get('/domain/:domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  req.session.errorMessages = []
  const configLetsproxy = new ConfigLetsproxy()
  const acme = new Acme()

  try {
    var domainConfig = configLetsproxy.domainsDict[req.params.domain]
    var domains = [req.params.domain]

    if (domainConfig.aliases) {
      domains = domains.concat(domainConfig.aliases)
    }

    configLetsproxy.removeDomain(req.params.domain)
    configLetsproxy.writeDomains()

    var P = acme.unwant(domains.join(' '))
    P.then(function () {
      req.session.errorMessages.push('Domain removed')
    }).catch(function (error) {
      console.error(error)
      req.session.errorMessages.push(`Error unwanting domains '${domains.join(' ')}'`)
    }).finally(function () {
      return res.redirect('/domains')
    })
  } catch (error) {
    console.error(error)
    req.session.errorMessages.push(error.message)
    return res.redirect('/domains')
  }
})

router.get('/server/:server', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  req.session.errorMessages = []
  const configLetsproxy = new ConfigLetsproxy()

  try {
    configLetsproxy.removeUpstream(req.params.server)
    configLetsproxy.writeUpstream()
  } catch (error) {
    console.error(error)
    req.session.errorMessages.push(error.message)
  }
  return res.redirect('/servers')
})

module.exports = router
