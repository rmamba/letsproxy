/* jslint es6 node:true */
// @ts-check
'use strict'

const fs = require('fs')
const express = require('express')
const router = express.Router()
const helper = require('../modules/helper')
const faviconFolder = './cache/favicon'
const ConfigFavicons = require('../modules/configs/favicons')
const Wget = require('../modules/wget')
const Nginx = require('../modules/system/nginx')
const nginx = new Nginx()
const mime = {
  ico: 'image/x-icon',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml'
}

router.get('/config/:domain', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var data = '{\n\t"error": "No config found!!!"\n}'
  if (fs.existsSync(`./nginx/sites-available/${req.params.domain}`)) {
    data = fs.readFileSync(`./nginx/sites-available/${req.params.domain}`).toString()
  }
  // res.header();
  res.end(data)
})

router.get('/favicon/:protocol/:url', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }
  var data
  var contentType = 'image/x-icon'

  const configFavicons = new ConfigFavicons()
  if (Object.prototype.hasOwnProperty.call(configFavicons, req.params.url)) {
    if (fs.existsSync(`${faviconFolder}/${configFavicons.faviconsDict[req.params.url].fileName}`)) {
      data = fs.readFileSync(`${faviconFolder}/${configFavicons.faviconsDict[req.params.url].fileName}`)
      res.set('Content-Type', configFavicons.faviconsDict[req.params.url].contentType)
      res.end(data, 'binary')
      return
    }
  }
  const wget = new Wget()
  var favicon = wget.favicon(req.params.protocol === 'https', req.params.url)
  if (favicon === undefined) {
    return res.redirect('/domains')
  }
  data = wget.binary(req.params.protocol === 'https', favicon)
  if (data instanceof Error) {
    console.log(data)
    data = fs.readFileSync(`${faviconFolder}/favicon.ico`)
    res.set('Content-Type', contentType)
    res.end(data, 'binary')
  }
  var parts = favicon.split('.')
  var iconType = parts[parts.length - 1]
  var fileName = `${helper.domain.to.backend(req.params.url)}.${iconType}`
  if (Object.prototype.hasOwnProperty.call(mime, iconType)) {
    contentType = mime[iconType]
  }
  fs.writeFileSync(`${faviconFolder}/${fileName}`, data, 'binary')
  configFavicons.faviconsDict[req.params.url] = {
    fileName: fileName,
    contentType: contentType,
    lastUpdated: new Date()
  }
  configFavicons.save()
  res.set('Content-Type', contentType)
  res.end(data, 'binary')
})

router.get('/nginx/test', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }

  nginx.test().then(response => {
    res.end(response)
  })
})

router.get('/nginx/reload', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }

  nginx.reload().then(response => {
    res.end(response)
  })
})

router.get('/nginx/stop', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }

  nginx.stop().then(response => {
    res.end(response)
  })
})

router.get('/nginx/start', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }

  nginx.start().then(response => {
    res.end(response)
  })
})

router.get('/nginx/running', (req, res) => {
  if (!req.session.user) {
    return res.redirect(401, '/login')
  }

  nginx.running().then(response => {
    res.end(response)
  })
})

module.exports = router
