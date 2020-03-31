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
    this.errors = {}

    const Acme = require('../system/acmetool')
    const Wget = require('../wget')
    this.wget = new Wget()
    this.acme = new Acme()

    if (fs.existsSync(this.FRONTEND_CONFIG)) {
      this.domains = JSON.parse(fs.readFileSync(this.FRONTEND_CONFIG).toString())
    }
  }

  writeConfig (domain) {
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
        if (check === 'working!!!') {
          response = wait.for.promise(this.acme.want(domains.join(' ')))
          if (response instanceof Error) {
            this.responses[domain] = response.message
          } else {
            this.responses[domain] = 'OK'
          } 
          return true
        }
      } else {
        // disabled certificates will not be able to be renewed after max 3 months
        // so we just unwant them
        response = wait.for.promise(this.acme.unwant(domains.join(' ')))
        if (response instanceof Error) {
          this.responses[domain] = response.message
        } else {
          this.responses[domain] = 'OK'
        }
      }
      return true
    }
    this.responses[domain] = `Domain '${domain}' not found.`
    return false
  }

  writeConfigs () {
    this.responses = {}
    this.checks = {}
    var ret = true
    Object.keys(this.domains).forEach(domain => {
      ret = ret && this.writeConfig(domain)
    })
    return ret
  }
}
