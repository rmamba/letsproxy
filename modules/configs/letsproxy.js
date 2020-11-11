/* eslint */
// @ts-check
'use strict'

const fs = require('fs')
const Acme = require('./acme')
const Nginx = require('./nginx')
const helper = require('../helper')

module.exports = class Letsproxy {
  constructor () {
    const PREFIX = process.env.NODE_ENV === 'test' ? './test' : '.'
    this.BACKEND_CONFIG = `${PREFIX}/config/backends.json`
    this.FRONTEND_CONFIG = `${PREFIX}/config/frontends.json`
    this.errors = undefined
    this.domainsDict = {}
    this.backendsDict = {}
    if (fs.existsSync(this.BACKEND_CONFIG)) {
      this.backendsDict = JSON.parse(fs.readFileSync(this.BACKEND_CONFIG).toString())
    } else {
      this.writeUpstream()
    }
    if (fs.existsSync(this.FRONTEND_CONFIG)) {
      this.domainsDict = JSON.parse(fs.readFileSync(this.FRONTEND_CONFIG).toString())
    } else {
      this.writeDomains()
    }
  }

  writeConfigs (acmeWant) {
    this.errors = []
    var ret = true
    const acme = new Acme()
    if (!acme.writeConfigs(acmeWant)) {
      this.errors.push('Acmetool error.')
      ret = false
    }
    const nginx = new Nginx()
    if (!nginx.writeConfigs()) {
      this.errors.push('Error writing Nginx configurations.')
      ret = false
    }
    return ret
  }

  writeUpstreams () {
    var ret = true
    const nginx = new Nginx()
    ret = ret && nginx.writeUpstreams()
    return ret
  }

  writeConfig (domain, acmeWant) {
    var ret = true
    const acme = new Acme()
    ret = ret && acme.writeConfig(domain, acmeWant)
    const nginx = new Nginx()
    ret = ret && nginx.writeConfig(domain)
    return ret
  }

  writeUpstream () {
    fs.writeFileSync(this.BACKEND_CONFIG, JSON.stringify(this.backendsDict, null, 2))
    return this.writeUpstreams()
  }

  updateUpstream (name, servers, sticky) {
    if (!(servers instanceof Array)) {
      throw new Error('Servers argument must be Array.')
    }
    if (servers.length === 0) {
      throw new Error('Servers argument can not be empty Array.')
    }
    servers.forEach(server => {
      if (!server.address) {
        throw new Error('Server must have address property.')
      }
      if (server.address === '') {
        throw new Error('Address property can not be empty string.')
      }
      if (!server.port) {
        throw new Error('Server must have port property.')
      }
      if (server.port === '') {
        throw new Error('Port property can not be empty.')
      }
    })
    this.backendsDict[name] = {
      servers: servers,
      sticky: sticky
    }
  }

  removeUpstream (name) {
    if (!this.backendsDict[name]) {
      throw new Error(`Upstream '${name}' not found.`)
    }
    const used = this.usedUpstreams()
    if (used.indexOf(name) !== -1) {
      // Upstream is used, needs to be removed first!
      throw new Error(`Upstream '${name}' is in use! Detach it from a domain first.`)
    }
    delete this.backendsDict[name]
  }

  removeDomain (name) {
    if (!this.domainsDict[name]) {
      throw new Error(`Upstream '${name}' not found.`)
    }
    delete this.domainsDict[name]
  }

  renameUpstream (oldName, newName) {
    if (this.backendsDict[oldName]) {
      delete this.backendsDict[oldName]
    }
    Object.keys(this.domainsDict).forEach(domain => {
      if (this.domainsDict[domain].location.proxy_pass.backend === oldName) {
        this.domainsDict[domain].location.proxy_pass.backend = newName
      }
    })
  }

  replaceUpstream (oldName, newName) {
    Object.keys(this.domainsDict).forEach(domain => {
      if (this.domainsDict[domain].location.proxy_pass.backend === oldName) {
        this.domainsDict[domain].location.proxy_pass.backend = newName
      }
    })
  }

  usedUpstreams () {
    var used = []
    Object.keys(this.domainsDict).forEach(domain => {
      if (this.domainsDict[domain].location.proxy_pass.backend !== undefined && this.domainsDict[domain].location.proxy_pass.backend !== '') {
        used.push(this.domainsDict[domain].location.proxy_pass.backend)
      }
    })
    return used
  }

  parseDomain (body) {
    var domain

    function parseRewrites (body) {
      var rewrites = {}
      for (let i = 0; i < body.rewriteKeys.length; i++) {
        if (body.rewriteKeys[i] !== '' && body.rewriteValues[i] !== '') {
          rewrites[body.rewriteKeys[i]] = body.rewriteValues[i]
        } else {
          // ToDO: Force user to enter data!
          // For now it is just going to be ignored!
          throw new Error('Can not save empty field!')
        }
      }
      return rewrites
    }

    function parseLocations (body) {
      var locations = {}
      for (let i = 0; i < body.locationKeys.length; i++) {
        if (body.locationKeys[i] !== '' && body.locationValues[i] !== '') {
          if (body.locationKeys[i] !== '/') {
            locations[body.locationKeys[i]] = body.locationValues[i].replace(/\r/g, '').replace(/\n\n/g, '\n').split('\n')
          } else {
            throw new Error('Can not use \'/\' as location, already in use!')
          }
        } else {
          // ToDO: Force user to enter data!
          // For now it is just going to be ignored!
          throw new Error('Can not save empty field!')
        }
      }
      return locations
    }

    if (body.externalDomain === '') {
      throw new Error('Domain name can not be empty.')
    }

    // https://stackoverflow.com/questions/16463666/javascript-regex-to-match-fully-qualified-domain-name-without-protocol-optiona/16463966
    // ToDO: add automated tests!
    if (!helper.domain.is.valid(body.externalDomain)) {
      throw new Error('Invalid domain name.')
    }

    if (body.domainAliases !== '') {
      body.domainAliases = body.domainAliases.replace(/ /g, '')
      var subDomains = body.domainAliases.split(',')
      subDomains.forEach(domain => {
        if (!helper.domain.is.valid(domain)) {
          throw new Error(`${domain} is not a valid domain name.`)
        }
      })
    }

    if (this.domainsDict[body.externalDomain]) {
      if (body.oldExternalDomain === '') {
        throw new Error('Domain name already exists.')
      }
      domain = this.domainsDict[body.externalDomain]
      domain.location.proxy_pass.backend = body.domainUpstream
      domain.location.proxy_pass.https = body.domainUpstreamHttps === 'true'
      if (body.domainTemplate !== '') {
        domain.template = body.domainTemplate
      } else {
        delete domain.template
      }
      if (body.rewriteKeys) {
        domain.rewrites = parseRewrites(body)
      } else {
        delete domain.rewrites
      }
      if (body.locationKeys) {
        domain.locations = parseLocations(body)
      } else {
        delete domain.locations
      }
    } else {
      domain = {
        enabled: false,
        httpRedirect: false,
        location: {
          path: '/',
          proxy_pass: {
            https: body.domainUpstreamHttps === 'true',
            backend: body.domainUpstream
          },
          proxy_next_upstream: 'error timeout invalid_header http_500 http_502 http_503 http_504',
          proxy_redirect: false,
          proxy_buffering: false,
          proxy_ssl_verify: false,
          proxy_set_header: {
            Host: '$host',
            'X-Real-IP': '$remote_addr',
            'X-Forwarded-For': '$proxy_add_x_forwarded_for',
            'X-Forwarded-Ssl': 'on'
          }
        },
        template: undefined,
        rewrites: undefined,
        locations: undefined
      }

      if (body.domainTemplate !== '') {
        domain.template = body.domainTemplate
      }
      if (body.rewriteKeys) {
        domain.rewrites = parseRewrites(body)
      }
      if (body.locationKeys) {
        domain.locations = parseLocations(body)
      }
    }

    if (body.domainAliases !== '') {
      domain.aliases = body.domainAliases.replace(/ /g, '').split(',')
    }

    return domain
  }

  updateDomain (name, data) {
    this.domainsDict[name] = data
  }

  writeDomains (acmeWant) {
    this.errors = []
    fs.writeFileSync(this.FRONTEND_CONFIG, JSON.stringify(this.domainsDict, null, 2))
    if (!this.writeConfigs(acmeWant)) {
      this.errors.push('Error saving domains configurations.')
      return false
    }
    return true
  }
}
