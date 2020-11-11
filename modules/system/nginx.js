/* eslint */
// @ts-check
'use strict'

const {
  exec
} = require('child_process')

module.exports = class Nginx {
  constructor () {
    this.SUDO = process.env.SUDO_NGINX_CMD || 'sudo '
    this.DEBUG = process.env.DEBUG === 'true'
  }

  log (msg) {
    if (this.DEBUG) {
      console.log(msg)
    }
  }

  start () {
    const SUDO = this.SUDO
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec(`${SUDO}nginx`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          if (stderr.indexOf('nginx: [emerg]') === -1) {
            resolve('OK')
          } else {
            resolve('ERROR')
          }
        }
      })
    })
  }

  stop () {
    const SUDO = this.SUDO
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec(`${SUDO}nginx -s stop`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          if (stderr.indexOf('error') === -1) {
            resolve('OK')
          } else {
            resolve('ERROR')
          }
        }
      })
    })
  }

  reload () {
    const SUDO = this.SUDO
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec(`${SUDO}nginx -s reload`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          if (stderr === '') {
            resolve('OK')
          } else {
            resolve('ERROR')
          }
        }
      })
    })
  }

  test () {
    const SUDO = this.SUDO
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec(`${SUDO}nginx -t`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          if (stderr.indexOf('syntax is ok') > 0) {
            resolve('OK')
          } else {
            resolve('ERROR')
          }
        }
      })
    })
  }

  running () {
    const THIS = this
    return new Promise(function (resolve, reject) {
      exec('ps waux | grep nginx', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.error(err)
          reject(err)
        } else {
          // the *entire* stdout and stderr (buffered)
          THIS.log(`stdout: ${stdout}`)
          THIS.log(`stderr: ${stderr}`)
          if (stdout.indexOf('nginx: master process') > 0) {
            resolve('RUNNING')
          } else {
            resolve('STOPPED')
          }
        }
      })
    })
  }
}
