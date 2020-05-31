/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()
const ConfigProxy = require('../modules/configs/letsproxy')
const ConfigNginx = require('../modules/configs/nginx')
const Settings = require('../modules/configs/settings')
const helper = require('../modules/helper')

router.get('/domains', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  notyMessages += helper.noty.parse(successMessages, 'success')

  const configNginx = new ConfigNginx()
  const settings = new Settings()
  res.render('domains', {
    user: req.session.user !== undefined ? req.session.user : false,
    notyMessages: notyMessages,
    domains: configNginx.domainsAsArray(),
    hasBackends: Object.keys(configNginx.backendsDict).length > 0,
    defaultDomain: settings.settings.defaultDomain ? settings.settings.defaultDomain : '',
    VERSION: process.env.VERSION
  })
})

router.get('/servers', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  notyMessages += helper.noty.parse(successMessages, 'success')

  const configNginx = new ConfigNginx()
  res.render('servers', {
    user: req.session.user !== undefined ? req.session.user : false,
    notyMessages: notyMessages,
    servers: configNginx.backendsDict,
    usedUpstreams: configNginx.usedUpstreamsAsArray(),
    VERSION: process.env.VERSION
  })
})

router.get('/domain/enable/:domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  req.session.errorMessages = []
  const configLetsproxy = new ConfigProxy()
  if (!Object.prototype.hasOwnProperty.call(configLetsproxy.domainsDict, req.params.domain)) {
    req.session.errorMessages.push('Domain not found.')
    return res.redirect('/domains')
  }
  configLetsproxy.domainsDict[req.params.domain].enabled = true
  configLetsproxy.writeDomains()
  configLetsproxy.writeConfig(req.params.domain)
  res.redirect('/domains')
})

router.get('/domain/disable/:domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  req.session.errorMessages = []
  const configLetsproxy = new ConfigProxy()
  if (!Object.prototype.hasOwnProperty.call(configLetsproxy.domainsDict, req.params.domain)) {
    req.session.errorMessages.push('Domain not found.')
    return res.redirect('/domains')
  }
  configLetsproxy.domainsDict[req.params.domain].enabled = false
  if (!configLetsproxy.writeDomains()) {
    req.session.errorMessages.push(configLetsproxy.error)
  }
  if (!configLetsproxy.writeConfig(req.params.domain)) {
    req.session.errorMessages.push(configLetsproxy.error)
  }
  res.redirect('/domains')
})

router.get('/domain/redirect/enable/:domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  req.session.errorMessages = undefined
  const configLetsproxy = new ConfigProxy()
  if (!Object.prototype.hasOwnProperty.call(configLetsproxy.domainsDict, req.params.domain)) {
    req.session.errorMessages.push('Domain not found.')
    return res.redirect('/domains')
  }
  configLetsproxy.domainsDict[req.params.domain].httpRedirect = true
  if (!configLetsproxy.writeDomains()) {
    req.session.errorMessages = req.session.errorMessages.concat(configLetsproxy.errors)
  }
  if (!configLetsproxy.writeConfig(req.params.domain)) {
    req.session.errorMessages = req.session.errorMessages.concat(configLetsproxy.errors)
  }
  res.redirect('/domains')
})

router.get('/domain/redirect/disable/:domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  req.session.errorMessages = []
  const configLetsproxy = new ConfigProxy()
  if (!Object.prototype.hasOwnProperty.call(configLetsproxy.domainsDict, req.params.domain)) {
    req.session.errorMessages.push('Domain not found.')
    return res.redirect('/domains')
  }
  configLetsproxy.domainsDict[req.params.domain].httpRedirect = false
  configLetsproxy.writeDomains()
  configLetsproxy.writeConfig(req.params.domain)
  res.redirect('/domains')
})

module.exports = router
