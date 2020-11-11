/* eslint */
// @ts-check
'use strict'

const fs = require('fs')
const wait = require('wait-for-stuff')

module.exports = class Acme {
  constructor () {
    const PREFIX = process.env.NODE_ENV === 'test' ? './test' : '.'
    this.ACME_FOLDER = `${PREFIX}/acme/desired`
    this.FRONTEND_CONFIG = `${PREFIX}/config/frontends.json`
    this.domains = {}
    this.checks = {}
    this.responses = {}
    this.errors = undefined

    const Acme = require('../system/acmetool')
    const Wget = require('../wget')
    this.wget = new Wget()
    this.acme = new Acme()

    if (fs.existsSync(this.FRONTEND_CONFIG)) {
      this.domains = JSON.parse(fs.readFileSync(this.FRONTEND_CONFIG).toString())
    }
  }

  writeConfig (domain, acmeWant) {
    var ret = true
    this.errors = []
    this.responses[domain] = undefined
    this.checks[domain] = undefined
    if (this.domains[domain]) {
      var domainConfig = this.domains[domain]
      var domains = [domain]

      if (domainConfig.aliases) {
        domains = domains.concat(domainConfig.aliases)
      }

      var config = 'satisfy:\n  names:\n'
      domains.forEach(d => {
        config += `  - ${d}\n`
      })
      fs.writeFileSync(`${this.ACME_FOLDER}/${domain}`, config)
      var response

      if (domainConfig.enabled === true) {
        const check = this.wget.data(false, `${domain}/.well-known/acme-challenge/test`)
        this.checks[domain] = check
        this.responses[domain] = 'OK'
        if (check === 'working!!!') {
          if (acmeWant) {
            response = wait.for.promise(this.acme.want(domains.join(' ')))
            if (response instanceof Error) {
              this.responses[domain] = response.message
              this.errors.push(response.message)
              ret = false
            }
          }
          return ret
        }
      } else {
        // disabled certificates will not be able to be renewed after max 3 months
        // so we just unwant them
        this.responses[domain] = 'OK'
        if (acmeWant) {
          response = wait.for.promise(this.acme.unwant(domains.join(' ')))
          if (response instanceof Error) {
            this.responses[domain] = response.message
            this.errors.push(response.message)
            ret = false
          }
        }
      }
      return ret
    }
    this.responses[domain] = `Domain '${domain}' not found.`
    this.errors.push(`Domain '${domain}' not found.`)
    return false
  }

  writeConfigs (acmeWant) {
    this.responses = {}
    this.checks = {}
    var ret = true
    Object.keys(this.domains).forEach(domain => {
      ret = ret && this.writeConfig(domain, acmeWant)
    })
    return ret
  }
}
