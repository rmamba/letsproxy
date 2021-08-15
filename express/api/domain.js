/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()

const ConfigNginx = require('../../modules/configs/nginx')
const Users = require('../../modules/configs/users')

router.post('/domain', (req, res) => {
  const configNginx = new ConfigNginx()
  const users = new Users()

  if (!req.headers.authorize) {
    return res.status(401).json({
      message: 'Missing token'
    })
  } else {
    var authorizeParts = req.headers.authorize
    if (typeof authorizeParts === 'string') {
      authorizeParts = authorizeParts.split(' ')
    }
    const token = authorizeParts[1]
    if (!users.checkToken(req.body.user, token)) {
      return res.status(401).json({
        message: 'Invalid token'
      })
    }
  }

  const domains = []
  Object.keys(configNginx.domainsDict).forEach(domain => {
    domains.push({
      ...{
        domain: domain
      },
      ...configNginx.domainsDict[domain]
    })
  })

  return res.json({
    domains: domains
  })
})

module.exports = router
