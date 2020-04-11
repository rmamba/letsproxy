/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()
const ConfigLetsproxy = require('../modules/configs/letsproxy')

router.post('/domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  req.session.successMessages = []
  req.session.errorMessages = []
  const configLetsproxy = new ConfigLetsproxy()

  var data
  try {
    data = configLetsproxy.parseDomain(req.body)
  } catch (error) {
    req.session.errorMessages.push(error.message)
    if (req.body.oldExternalDomain === '') {
      return res.redirect('/add/domain/')
    }
    return res.redirect('/edit/domain/' + req.body.externalDomain)
  }

  configLetsproxy.updateDomain(req.body.externalDomain, data)
  if (!configLetsproxy.writeDomains()) {
    req.session.errorMessages = req.session.errorMessages.concat(configLetsproxy.errors)
  }
  if (req.body.oldExternalDomain !== '' && req.body.oldExternalDomain !== req.body.externalDomain) {
    configLetsproxy.removeDomain(req.body.oldExternalDomain)
  }
  if (!configLetsproxy.writeConfigs()) {
    req.session.errorMessages = req.session.errorMessages.concat(configLetsproxy.errors)
  }

  if (req.session.errorMessages.length === 0) {
    req.session.successMessages.push('Configuration updated.')
  }

  return res.redirect('/domains')
})

router.post('/server', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  req.session.successMessages = []
  req.session.errorMessages = []
  const configLetsproxy = new ConfigLetsproxy()

  if (req.body.oldUpstreamName === '') {
    if (Object.prototype.hasOwnProperty.call(configLetsproxy.backendsDict, req.body.upstreamName)) {
      req.session.errorMessages.push('Server with this name already exists.')
      return res.redirect('/add/server')
    }
  }

  if (req.body.upstreamName === '') {
    req.session.errorMessages.push('Can not use empty name for upstream.')
    return res.redirect('/add/server')
  }

  if (req.body.upstreamName !== req.body.upstreamName.replace(/[^a-z0-9-]/gi, '')) {
    req.session.errorMessages.push('Only letters, numbers and dash is allowed for upstream naming.')
    return res.redirect('/add/server')
  }

  var servers = []
  for (let i = 0; i < req.body.upstreamAddresses.length; i++) {
    servers.push({
      address: req.body.upstreamAddresses[i],
      port: req.body.upstreamPorts[i]
    })
  }

  if (req.body.oldUpstreamName !== '' && req.body.oldUpstreamName !== req.body.upstreamName) {
    configLetsproxy.replaceUpstream(req.body.oldUpstreamName, req.body.upstreamName)
  }

  try {
    configLetsproxy.updateUpstream(req.body.upstreamName, servers, req.body.stickySession === 'on')
  } catch (error) {
    req.session.errorMessages.push(error.message)
    if (req.body.oldUpstreamName === '') {
      return res.redirect('/add/server/')
    }
    return res.redirect('/edit/server/' + req.body.upstreamName)
  }
  if (!configLetsproxy.writeUpstream()) {
    req.session.errorMessages = req.session.errorMessages.concat(configLetsproxy.errors)
  }
  if (!configLetsproxy.writeDomains()) {
    req.session.errorMessages = req.session.errorMessages.concat(configLetsproxy.errors)
  }

  if (req.session.errorMessages.length === 0) {
    req.session.successMessages.push('Configuration updated.')
  }

  // if (req.body.oldUpstreamName !== '' && req.body.oldUpstreamName !== req.body.upstreamName) {
  //     configLetsproxy.removeUpstream(req.body.oldUpstreamName)
  //     configLetsproxy.writeUpstream();
  // }

  return res.redirect('/servers')
})

module.exports = router
