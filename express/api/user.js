/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()

const Users = require('../../modules/configs/users')

router.post('/login', (req, res) => {
  const users = new Users()
  if (!users.exists(req.body.user)) {
    return res.status(400).json({
      message: 'Unknown user'
    })
  }
  if (!req.body.password) {
    return res.status(400).json({
      message: 'Missing password'
    })
  }
  if (!users.checkPassword(req.body.user, req.body.password)) {
    return res.status(401).json({
      message: 'Invalid password'
    })
  }
  return res.json({
    token: users.getOrCreateToken(req.body.user, 3600),
    validUntil: users.tokenExpires(req.body.user),
    firstLogin: false,
    changePassword: false
  })
})

router.post('/logout', (req, res) => {
  const users = new Users()
  if (!users.exists(req.body.user)) {
    return res.status(400).json({
      message: 'Unknown user'
    })
  }
  if (!req.headers.authorization) {
    return res.status(401).json({
      message: 'Missing token'
    })
  } else {
    var authorizeParts = req.headers.authorization
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
  users.removeToken(req.body.user)
  return res.status(204).end()
})

module.exports = router
