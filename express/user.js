/* jslint es6 node:true */
// @ts-check
'use strict'

const md5 = require('md5')
const express = require('express')
const router = express.Router()
const helper = require('../modules/helper')

const PASSWD = require('../passwd')

router.get('/login', (req, res) => {
  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  notyMessages += helper.noty.parse(successMessages, 'success')

  res.render('login', {
    notyMessages: notyMessages,
    VERSION: process.env.VERSION
  })
})

router.post('/login', (req, res) => {
  req.session.errorMessages = []
  req.session.successMessages = []
  if (!PASSWD[req.body.user]) {
    req.session.errorMessages.push('Unknown user!')
    return res.redirect('/login')
  }
  if (PASSWD[req.body.user].password !== md5(req.body.password)) {
    req.session.errorMessage.push('Invalid password!')
    return res.redirect('/login')
  }
  if (req.session.user === undefined) {
    req.session.user = {
      name: req.body.user,
      isAdmin: PASSWD[req.body.user].isAdmin
    }
  }
  res.redirect('/')
})

router.get('/logout', (req, res) => {
  req.session.user = undefined
  res.redirect('/')
})

module.exports = router
