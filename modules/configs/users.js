/* eslint */
// @ts-check
'use strict'

const fs = require('fs')
const crypto = require('crypto')
const superchargeStrings = require('@supercharge/strings')

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
      if (this.users[user].password.toLowerCase() === crypto.createHash('sha256').update(password).digest('hex')) {
        return true
      }
    }
    return false
  }

  getOrCreateToken (user, ttl = 3600) {
    if (this.users[user]) {
      if (!this.users[user].token || (this.utcTimeInSeconds() > this.users[user].tokenExpiration)) {
        this.users[user].token = superchargeStrings.random(64)
        this.users[user].tokenExpiration = this.utcTimeInSeconds(ttl)
      } else {
        this.extendToken(user, ttl)
      }
      this.saveConfig()
      return this.users[user].token
    }
    return false
  }

  extendToken (user, ttl) {
    if (this.users[user]) {
      if (!this.users[user].token) {
        this.users[user].token = superchargeStrings.random(64)
      }
      this.users[user].tokenExpiration = this.utcTimeInSeconds(ttl)
      this.saveConfig()
      return true
    }
    return false
  }

  validToken (user) {
    if (
      this.users[user] &&
      this.users[user].token &&
      this.users[user].tokenExpiration &&
      this.utcTimeInSeconds() < this.users[user].tokenExpiration
    ) {
      return true
    }
    return false
  }

  tokenExpires (user) {
    if (
      this.users[user] &&
      this.users[user].token
    ) {
      return this.users[user].tokenExpiration
    }
    return -1
  }

  checkToken (user, token) {
    if (
      this.validToken(user) &&
      this.users[user].token === token
    ) {
      return true
    }
    return false
  }

  removeToken (user) {
    if (this.users[user]) {
      this.users[user].token = undefined
      this.users[user].tokenExpiration = undefined
      this.saveConfig()
      return true
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

  utcTimeInSeconds (add = 0) {
    const now = new Date()
    return Math.floor(new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    ).getTime() / 1000) + add
  }
}
