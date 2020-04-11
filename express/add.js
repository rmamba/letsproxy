/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()
const ConfigLetsproxy = require('../modules/configs/letsproxy')

router.get('/domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []
  const configLetsproxy = new ConfigLetsproxy()
  res.render('domain', {
    user: req.session.user !== undefined ? req.session.user : false,
    errorMessages: errorMessages,
    successMessages: successMessages,
    domain: {},
    upstreamServers: Object.keys(configLetsproxy.backendsDict),
    serverRewrites: [],
    serverLocations: [],
    VERSION: process.env.VERSION
  })
})

router.get('/server', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []
  res.render('server', {
    user: req.session.user !== undefined ? req.session.user : false,
    errorMessages: errorMessages,
    successMessages: successMessages,
    upstreamName: null,
    upstreamServers: [{
      address: null,
      port: null
    }],
    VERSION: process.env.VERSION
  })
})

module.exports = router
