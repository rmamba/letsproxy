/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()
const ConfigLetsproxy = require('../modules/configs/letsproxy')
const helper = require('../modules/helper')

router.get('/domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  notyMessages += helper.noty.parse(successMessages, 'success')

  const configLetsproxy = new ConfigLetsproxy()
  res.render('domain', {
    user: req.session.user !== undefined ? req.session.user : false,
    notyMessages: notyMessages,
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

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  notyMessages += helper.noty.parse(successMessages, 'success')

  res.render('server', {
    user: req.session.user !== undefined ? req.session.user : false,
    notyMessages: notyMessages,
    upstreamName: null,
    upstreamServers: [{
      address: null,
      port: null
    }],
    VERSION: process.env.VERSION
  })
})

module.exports = router
