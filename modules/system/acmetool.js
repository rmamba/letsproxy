/* eslint */
// @ts-check
'use strict'

const Settings = require('../../modules/configs/settings')

const {
  exec
} = require('child_process')

module.exports = class Acmetool {
  constructor () {
    this.SUDO = process.env.SUDO_ACMETOOL_CMD || 'sudo '
    this.BATCH = ''
    this.DEBUG = process.env.DEBUG === 'true'
  }

  log (msg) {
    if (this.DEBUG) {
      console.log(msg)
    }
  }

  want (domains) {
    const DOMAINS = domains
    const SUDO = this.SUDO
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec(`${SUDO}acmetool want ${DOMAINS}`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          resolve(true)
        }
      })
    })
  }

  unwant (domains) {
    const DOMAINS = domains
    const SUDO = this.SUDO
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec(`${SUDO}acmetool unwant ${DOMAINS}`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          resolve(true)
        }
      })
    })
  }

  status () {
    const SUDO = this.SUDO
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec(`${SUDO}acmetool status`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          resolve(true)
        }
      })
    })
  }

  run (forceRun = false) {
    const settings = new Settings()
    if (!settings.settings.autorunAcmetool && !forceRun) {
      return new Promise(function (resolve, reject) {
        resolve(true)
      })
    }
    const SUDO = this.SUDO
    const BATCH = this.BATCH
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec(`${SUDO}acmetool${BATCH}`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          resolve(true)
        }
      })
    })
  }
}
