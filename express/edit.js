/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()
const ConfigLetsproxy = require('../modules/configs/letsproxy')
const helper = require('../modules/helper')

router.get('/domain/:domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []
  const configLetsproxy = new ConfigLetsproxy()
  if (!Object.prototype.hasOwnProperty.call(configLetsproxy.domainsDict, req.params.domain)) {
    req.session.errorMessages.push('Unknown domain!!!')
    return res.redirect('/domains')
  }
  var aliases = ''
  if (Object.prototype.hasOwnProperty.call(configLetsproxy.domainsDict[req.params.domain], 'aliases')) {
    aliases = configLetsproxy.domainsDict[req.params.domain].aliases.join(',')
  }

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  notyMessages += helper.noty.parse(successMessages, 'sucess')
  res.render('domain', {
    user: req.session.user !== undefined ? req.session.user : false,
    notyMessages: notyMessages,
    externalDomain: req.params.domain,
    domainUpstream: configLetsproxy.domainsDict[req.params.domain].location.proxy_pass.backend,
    domainUpstreamHttps: configLetsproxy.domainsDict[req.params.domain].location.proxy_pass.https === true ? 'true' : 'false',
    domainAliases: aliases,
    upstreamServers: Object.keys(configLetsproxy.backendsDict),
    domainTemplate: configLetsproxy.domainsDict[req.params.domain].template || '',
    serverRewrites: configLetsproxy.domainsDict[req.params.domain].rewrites || {},
    serverLocations: configLetsproxy.domainsDict[req.params.domain].locations || {},
    VERSION: process.env.VERSION
  })
})

router.get('/server/:server', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var errorMessages = req.session.errorMessages
  req.session.errorMessages = []
  req.session.successMessages = []
  const configLetsproxy = new ConfigLetsproxy()
  if (!Object.prototype.hasOwnProperty.call(configLetsproxy.backendsDict, req.params.server)) {
    req.session.errorMessages.push('Unknown server!!!')
    return res.redirect('/servers')
  }

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  res.render('server', {
    user: req.session.user !== undefined ? req.session.user : false,
    notyMessages: notyMessages,
    upstreamName: req.params.server,
    upstreamServers: configLetsproxy.backendsDict[req.params.server].servers,
    isSticky: configLetsproxy.backendsDict[req.params.server].sticky,
    VERSION: process.env.VERSION
  })
})

module.exports = router
