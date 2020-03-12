/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()
const ConfigLetsproxy = require('../modules/configs/letsproxy')

router.get('/domain/:domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var errorMessage = req.session.errorMessage
  req.session.errorMessage = undefined
  const configLetsproxy = new ConfigLetsproxy()
  if (!configLetsproxy.domainsDict.hasOwnProperty(req.params.domain)) {
    req.session.errorMessage = 'Unknown domain!!!'
    return res.redirect('/domains')
  }
  var aliases = ''
  if (configLetsproxy.domainsDict[req.params.domain].hasOwnProperty('aliases')) {
    aliases = configLetsproxy.domainsDict[req.params.domain].aliases.join(',')
  }
  res.render('domain', {
    user: req.session.user !== undefined ? req.session.user : false,
    errorMessage: errorMessage,
    externalDomain: req.params.domain,
    domainUpstream: configLetsproxy.domainsDict[req.params.domain].location.proxy_pass.backend,
    domainUpstreamHttps: configLetsproxy.domainsDict[req.params.domain].location.proxy_pass.https === true ? 'true' : 'false',
    domainAliases: aliases,
    upstreamServers: Object.keys(configLetsproxy.backendsDict),
    domainTemplate: configLetsproxy.domainsDict[req.params.domain].template || '',
    VERSION: process.env.VERSION
  })
})

router.get('/server/:server', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var errorMessage = req.session.errorMessage
  req.session.errorMessage = undefined
  const configLetsproxy = new ConfigLetsproxy()
  if (!configLetsproxy.backendsDict.hasOwnProperty(req.params.server)) {
    req.session.errorMessage = 'Unknown server!!!'
    return res.redirect('/servers')
  }
  res.render('server', {
    user: req.session.user !== undefined ? req.session.user : false,
    errorMessage: errorMessage,
    upstreamName: req.params.server,
    upstreamServers: configLetsproxy.backendsDict[req.params.server].servers,
    VERSION: process.env.VERSION
  })
})

module.exports = router
