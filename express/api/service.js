/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()

const ConfigNginx = require('../../modules/configs/nginx')
const Users = require('../../modules/configs/users')

router.post('/services', (req, res) => {
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

  const services = []
  Object.keys(configNginx.backendsDict).forEach(upstream => {
    services.push({
      ...{
        name: upstream
      },
      ...configNginx.backendsDict[upstream]
    })
  })

  return res.json({
    services: services
  })
})

module.exports = router
