/* eslint */
// @ts-check
'use strict'

const fs = require('fs')
const crypto = require('crypto')

module.exports = class Users {
  constructor () {
    const PREFIX = process.env.NODE_ENV === 'test' ? './test' : '.'
    this.USERS_FILE = `${PREFIX}/config/users.json`
    this.users = {}
    this.errors = undefined

    if (fs.existsSync(this.USERS_FILE)) {
      this.users = JSON.parse(fs.readFileSync(this.USERS_FILE).toString())
    }
  }

  isAdmin (user) {
    if (this.users[user]) {
      return this.users[user].isAdmin
    }
    return false
  }

  isEmpty () {
    return Object.keys(this.users).length === 0
  }

  exists (user) {
    if (this.users[user]) {
      return true
    }
    return false
  }

  checkPassword (user, password) {
    if (this.users[user]) {
      if (this.users[user].password === crypto.createHash('sha256').update(password).digest('hex')) {
        return true
      }
    }
    return false
  }

  addUser (user, password, isAdmin = false) {
    if (!this.users[user]) {
      this.users[user] = {
        isAdmin: isAdmin,
        password: crypto.createHash('sha256').update(password).digest('hex')
      }
    }
  }

  saveConfig () {
    this.errors = []
    if (this.users) {
      fs.writeFileSync(this.USERS_FILE, JSON.stringify(this.users))
      return true
    }
    return false
  }
}
