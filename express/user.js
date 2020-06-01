/* jslint es6 node:true */
// @ts-check
'use strict'

const express = require('express')
const router = express.Router()
const helper = require('../modules/helper')

const Users = require('../modules/configs/users')
const users = new Users()

router.get('/first', (req, res) => {
  if (!users.isEmpty()) {
    return res.redirect('/login')
  }

  var errorMessages = req.session.errorMessages
  var successMessages = req.session.successMessages
  req.session.errorMessages = []
  req.session.successMessages = []

  var notyMessages = helper.noty.parse(errorMessages, 'error')
  notyMessages += helper.noty.parse(successMessages, 'success')

  res.render('first', {
    notyMessages: notyMessages,
    VERSION: process.env.VERSION
  })
})

router.post('/first', (req, res) => {
  req.session.errorMessages = []
  req.session.successMessages = []
  // if (users.exists(req.body.user)) {
  //   req.session.errorMessages.push('User exists!')
  //   return res.redirect('/login')
  // }
  if (req.body.password !== req.body.password2) {
    req.session.errorMessages.push('Passwords do not match!')
    return res.redirect('/first')
  }
  users.addUser(req.body.user, req.body.password, true)
  users.saveConfig()
  req.session.successMessages.push('Admin created, please login!')
  res.redirect('/login')
})

router.get('/login', (req, res) => {
  if (users.isEmpty()) {
    return res.redirect('/first')
  }
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
  if (!users.exists(req.body.user)) {
    req.session.errorMessages.push('Unknown user!')
    return res.redirect('/login')
  }
  if (!users.checkPassword(req.body.user, req.body.password)) {
    req.session.errorMessages.push('Invalid password!')
    return res.redirect('/login')
  }
  if (req.session.user === undefined) {
    req.session.user = {
      name: req.body.user,
      isAdmin: users.isAdmin(req.body.user)
    }
  }
  res.redirect('/')
})

router.get('/logout', (req, res) => {
  req.session.user = undefined
  res.redirect('/')
})

module.exports = router
