/* eslint */
// @ts-check
'use strict'

const fs = require('fs')
const Acme = require('./acme')
const Nginx = require('./nginx')

module.exports = class Letsproxy {
  constructor () {
    const PREFIX = process.env.NODE_ENV === 'test' ? './test' : '.'
    this.BACKEND_CONFIG = `${PREFIX}/config/backends.json`
    this.FRONTEND_CONFIG = `${PREFIX}/config/frontends.json`
    this.error = undefined
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

  writeConfigs () {
    var ret = true
    const acme = new Acme()
    ret = ret && acme.writeConfigs()
    const nginx = new Nginx()
    ret = ret && nginx.writeConfigs()
    return ret
  }

  writeUpstreams () {
    var ret = true
    const nginx = new Nginx()
    ret = ret && nginx.writeUpstreams()
    return ret
  }

  writeConfig (domain) {
    var ret = true
    const acme = new Acme()
    ret = ret && acme.writeConfig(domain)
    const nginx = new Nginx()
    ret = ret && nginx.writeConfig(domain)
    return ret
  }

  writeUpstream () {
    fs.writeFileSync(this.BACKEND_CONFIG, JSON.stringify(this.backendsDict, null, 2))
    this.writeUpstreams()
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
      return
    }
    delete this.backendsDict[name]
  }

  removeDomain (name) {
    this.error = undefined
    if (!this.domainsDict[name]) {
      this.error = new Error(`Upstream '${name}' not found.`)
      return false
    }
    delete this.domainsDict[name]
    return true
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
    if (this.domainsDict[body.externalDomain]) {
      domain = this.domainsDict[body.externalDomain]
      domain.location.proxy_pass.backend = body.domainUpstream
      domain.location.proxy_pass.https = body.domainUpstreamHttps === 'true'
      if (body.domainTemplate !== '') {
        domain.template = body.domainTemplate
      } else {
        delete domain.template
      }
      if (body.rewriteKeys) {
        var rewrites = {}
        for (let i = 0; i < body.rewriteKeys.length; i++) {
          if (body.rewriteKeys[i] !== '' && body.rewriteValues[i] !== '') {
            rewrites[body.rewriteKeys[i]] = body.rewriteValues[i]
          } else {
            // ToDO: Force user to enter data!
            // For now it is just going to be ignored!
          }
        }
        domain.rewrites = rewrites
      } else {
        delete domain.rewrites
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
        }
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

  writeDomains () {
    fs.writeFileSync(this.FRONTEND_CONFIG, JSON.stringify(this.domainsDict, null, 2))
    return this.writeConfigs()
  }
}
