/* jslint es6 node:true */
// @ts-check
'use strict'

// const md5 = require('md5')
const express = require('express')
const router = express.Router()
const helper = require('../modules/helper')
const ConfigNginx = require('../modules/configs/nginx')
const Settings = require('../modules/configs/settings')

router.get('/', (req, res) => {
  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []
  if (!req.session.user || !req.session.user.isAdmin) {
    req.session.errorMessages.push('Access denied!')
    return res.redirect('/')
  }

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  notyMessages += helper.noty.parse(successMessages, 'success')

  const configNginx = new ConfigNginx()
  const settings = new Settings()
  console.log(settings.settings)
  res.render('settings', {
    notyMessages: notyMessages,
    user: req.session.user !== undefined ? req.session.user : false,
    defaultDomain: settings.settings.defaultDomain ? settings.settings.defaultDomain : '',
    autorunAcmetool: settings.settings.autorunAcmetool ? settings.settings.autorunAcmetool : '',
    enabeHTTP2: settings.settings.enabeHTTP2 ? settings.settings.enabeHTTP2 : '',
    defaultUploadSize: settings.settings.defaultUploadSize ? settings.settings.defaultUploadSize : '',
    domains: configNginx.domainsAsArray(),
    VERSION: process.env.VERSION
  })
})

router.post('/', (req, res) => {
  req.session.errorMessages = []
  req.session.successMessages = []
  if (!req.session.user || !req.session.user.isAdmin) {
    req.session.errorMessages.push('Access denied!')
    return res.redirect('/')
  }

  const settings = new Settings()
  var save = false
  var oldDomain = settings.settings.defaultDomain
  if (req.body.defaultDomain) {
    settings.settings.defaultDomain = req.body.defaultDomain
    save = true
  } else {
    if (settings.settings.defaultDomain) {
      delete settings.settings.defaultDomain
      save = true
    }
  }

  req.body.autorunAcmetool = req.body.autorunAcmetool === 'on'
  req.body.enabeHTTP2 = req.body.enabeHTTP2 === 'on'

  if (req.body.autorunAcmetool !== settings.settings.autorunAcmetool) {
    settings.settings.autorunAcmetool = req.body.autorunAcmetool
    save = true
  }
  if (req.body.enabeHTTP2 !== settings.settings.enabeHTTP2) {
    settings.settings.enabeHTTP2 = req.body.enabeHTTP2
    save = true
  }
  if (req.body.defaultUploadSize !== settings.settings.defaultUploadSize) {
    settings.settings.defaultUploadSize = req.body.defaultUploadSize
    save = true
  }

  if (save) {
    settings.saveConfig()
    const configNginx = new ConfigNginx()
    if (oldDomain) {
      configNginx.writeConfig(oldDomain)
    }
    configNginx.writeConfig(req.body.defaultDomain)
  }

  return res.redirect('/settings')
})

module.exports = router
