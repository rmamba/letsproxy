/* eslint */
// @ts-check
'use strict'

const fs = require('fs')

module.exports = class Settings {
  constructor () {
    const PREFIX = process.env.NODE_ENV === 'test' ? './test' : '.'
    this.SETTINGS_CONFIG = `${PREFIX}/config/settings.json`
    this.settings = {
      autorunAcmetool: false,
      enableHTTP2: true,
      defaultUploadSize: '10M'
    }
    this.errors = undefined

    if (fs.existsSync(this.SETTINGS_CONFIG)) {
      this.settings = JSON.parse(fs.readFileSync(this.SETTINGS_CONFIG).toString())
    }
  }

  saveConfig () {
    this.errors = []
    if (this.settings) {
      fs.writeFileSync(this.SETTINGS_CONFIG, JSON.stringify(this.settings))
      return true
    }
    return false
  }
}
