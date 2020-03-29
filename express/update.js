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
  req.session.errorMessage = undefined
  const configLetsproxy = new ConfigLetsproxy()

  var data
  try {
    data = configLetsproxy.parseDomain(req.body)
  } catch (error) {
    req.session.errorMessage = error.message
    return res.redirect('/edit/domain/' + req.body.externalDomain)
  }

  configLetsproxy.updateDomain(req.body.externalDomain, data)
  configLetsproxy.writeDomains()
  if (req.body.oldExternalDomain !== '' && req.body.oldExternalDomain !== req.body.externalDomain) {
    configLetsproxy.removeDomain(req.body.oldExternalDomain)
  }
  configLetsproxy.writeConfigs()

  return res.redirect('/domains')
})

router.post('/server', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  req.session.errorMessage = undefined
  const configLetsproxy = new ConfigLetsproxy()

  if (req.body.oldUpstreamName === '') {
    if (Object.prototype.hasOwnProperty.call(configLetsproxy.backendsDict, req.body.upstreamName)) {
      req.session.errorMessage = 'Server with this name already exists.'
      return res.redirect('/add/server')
    }
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
    req.session.errorMessage = error.message
    return res.redirect('/edit/server/' + req.body.upstreamName)
  }
  configLetsproxy.writeUpstream()
  configLetsproxy.writeDomains()

  // if (req.body.oldUpstreamName !== '' && req.body.oldUpstreamName !== req.body.upstreamName) {
  //     configLetsproxy.removeUpstream(req.body.oldUpstreamName)
  //     configLetsproxy.writeUpstream();
  // }

  return res.redirect('/servers')
})

module.exports = router
