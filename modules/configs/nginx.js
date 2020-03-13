/* eslint */
// @ts-check
'use strict'

const fs = require('fs')
const wait = require('wait-for-stuff')
const CONFIG = require('../../config/config')
const SystemNginx = require('../system/nginx')
const nginx = new SystemNginx()

module.exports = class Nginx {
  constructor () {
    const PREFIX = process.env.NODE_ENV === 'test' ? './test' : '.'
    const ROOT_PREFIX = process.env.NODE_ENV === 'test' ? './test' : ''
    this.BACKEND_CONFIG = `${PREFIX}/config/backends.json`
    this.FRONTEND_CONFIG = `${PREFIX}/config/frontends.json`
    this.NGINX_FOLDER = `${PREFIX}/nginx`
    this.NGINX_TEMPLATES = `${this.NGINX_FOLDER}/templates`
    this.ACME_FOLDER = `${ROOT_PREFIX}/var/lib/acme`
    this.domainsDict = {}
    this.backendsDict = {}
    this.responses = {}
    this.IGNORE = ['aliases', 'enabled', 'path', 'template', 'location', 'httpRedirect']
    if (fs.existsSync(this.FRONTEND_CONFIG)) {
      this.domainsDict = JSON.parse(fs.readFileSync(this.FRONTEND_CONFIG).toString())
    }
    if (fs.existsSync(this.BACKEND_CONFIG)) {
      this.backendsDict = JSON.parse(fs.readFileSync(this.BACKEND_CONFIG).toString())
    }
  }

  setServerProperties (domain, properties) {
    if (!this.domainsDict[domain]) {
      console.error(`domainsDict does not contain '${domain}'.`)
      return false
    }
    var D = this.domainsDict[domain]
    Object.keys(properties).forEach(property => {
      D[property] = properties[property]
    })
    return true
  }

  setLocationProperties (domain, properties) {
    if (!this.domainsDict[domain]) {
      console.error(`domainsDict does not contain '${domain}'.`)
      return false
    }
    var D = this.domainsDict[domain]
    if (!D.location) {
      D.location = {}
    }
    Object.keys(properties).forEach(property => {
      D.location[property] = properties[property]
    })
    return true
  }

  assignTemplate (domain, name) {
    if (!fs.existsSync(`${this.NGINX_TEMPLATES}/${name}.json`)) {
      throw new Error('Unknown template.')
    }
    var template = JSON.parse(fs.readFileSync(`${this.NGINX_TEMPLATES}/${name}.json`).toString())
    if (template.server) {
      this.setServerProperties(domain, template.server)
    }
    if (template.location) {
      this.setLocationProperties(domain, template.location)
    }
  }

  domainsAsArray () {
    var domainsArray = []
    Object.keys(this.domainsDict).sort().forEach(domain => {
      var domainData = this.domainsDict[domain]
      domainData.certificates = fs.existsSync(`${this.ACME_FOLDER}/live/${domain}/fullchain`)
      var data = {
        name: domain,
        settings: domainData,
        backend: this.backendsDict[domainData.location.proxy_pass.backend],
        backendName: domainData.location.proxy_pass.backend,
        httpRedirect: domainData.httpRedirect
      }
      domainsArray.push(data)
    })
    return domainsArray
  }

  usedUpstreamsAsArray () {
    var used = []
    Object.keys(this.domainsDict).sort().forEach(domain => {
      if (this.domainsDict[domain].location.proxy_pass.backend !== undefined && this.domainsDict[domain].location.proxy_pass.backend !== '') {
        used.push(this.domainsDict[domain].location.proxy_pass.backend)
      }
    })
    return used
  }

  /**
   * Write upstream configuration to drive. It returns false
   * on error.
   * @returns {boolean}
   */
  writeUpstreams () {
    var config = ''

    if (this.backendsDict !== undefined) {
      Object.keys(this.backendsDict).forEach(upstream => {
        config += `upstream ${upstream} {\n`
        this.backendsDict[upstream].servers.forEach(server => {
          config += `\tserver ${server.address}`
          if (server.port) {
            config += `:${server.port}`
          }
          if (server.extra) {
            config += ` ${server.extra}`
          }
          config += ';\n'
        })
        config += '}\n\n'
      })
    }

    fs.writeFileSync(`${this.NGINX_FOLDER}/sites-available/upstreams`, config)
    var exists = true
    try {
      fs.lstatSync(`${this.NGINX_FOLDER}/sites-enabled/upstreams`)
    } catch (e) {
      exists = false
    }

    var ret = true
    if (!exists) {
      fs.symlinkSync('../sites-available/upstreams', `${this.NGINX_FOLDER}/sites-enabled/upstreams`)
      var response = wait.for.promise(nginx.test())
      if (response === 'OK') {
        response = wait.for.promise(nginx.reload())
        this.responses.upstream = response
        if (response !== 'OK') {
          console.log('Error: ' + response)
          ret = false
        }
      } else {
        this.responses.response = 'Invalid Nginx configuration.'
      }
    }
    return ret
  }

  /**
   * Write `domain` configuration to drive. It returns false
   * on error.
   * @param {string} domain
   * @returns {boolean}
   */
  writeConfig (domain) {
    var D = this.domainsDict[domain]
    var isFirst
    var ret = true
    this.responses[domain] = undefined

    if (D.hasOwnProperty.template) {
      if (D.template !== '') {
        this.assignTemplate(domain, D.template)
      }
    }

    var config = ''
    var domains = domain.toLowerCase()
    if (D.aliases) {
      domains += ` ${D.aliases.join(' ')}`
    }
    config += 'server {\n'
    config += '\tlisten 80;\n'
    config += `\tserver_name ${domains.toLowerCase()};\n`

    // #ACME
    config += '\n\tlocation ^~ /.well-known/acme-challenge/ {\n'
    config += '\t\tallow all;\n'
    config += '\t\tdefault_type "text/plain";\n'
    config += `\t\talias ${CONFIG.acme.challenge}/;\n`
    config += '\t}\n'
    config += '\t\n\tlocation = /.well-known/acme-challenge/ {\n'
    config += '\t\treturn 404;\n'
    config += '\t}\n'

    if (D.httpRedirect === true) {
      config += '\n\tlocation / {\n'
      config += '\t\treturn 301 https://$host$request_uri;\n'
      config += '\t}\n'
    }
    config += '}\n'

    var isCert = '#'
    if (fs.existsSync(`${CONFIG.acme.certificates}/${domain.toLowerCase()}/fullchain`)) {
      isCert = ''
    }

    config += '\nserver {\n'
    config += '\tlisten 443'

    if (isCert === '') {
      config += ' ssl'
    }
    config += ';\n'

    config += `\tserver_name ${domains.toLowerCase()};\n`
    config += `\taccess_log /var/log/nginx/${domain.toLowerCase()}.access.log;\n`
    config += `\terror_log /var/log/nginx/${domain.toLowerCase()}.error.log;\n`

    config += `${isCert}\tssl_dhparam ${CONFIG.nginx}/dhparam.pem;\n`
    config += `${isCert}\tssl_prefer_server_ciphers on;\n`
    config += `${isCert}\tssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';\n`
    config += `${isCert}\tssl_certificate ${CONFIG.acme.certificates}/${domain.toLowerCase()}/fullchain;\n`
    config += `${isCert}\tssl_certificate_key ${CONFIG.acme.certificates}/${domain.toLowerCase()}/privkey;\n`

    isFirst = true
    Object.keys(D).forEach(p => {
      if (this.IGNORE.indexOf(p) === -1) {
        if (isFirst) {
          config += '\t\n'
          isFirst = false
        }
        config += `\t${p} ${D[p]};\n`
      }
    })

    config += `\t\n\tlocation ${D.location.path} {\n`
    Object.keys(D.location).forEach(p => {
      if (p === 'proxy_pass') {
        if (D.location.proxy_pass.backend) {
          config += `\t\tproxy_pass http${D.location.proxy_pass.https ? 's' : ''}://${D.location.proxy_pass.backend};\n`
        } else {
          config += `\t\tproxy_pass http${D.location.proxy_pass.https ? 's' : ''}://${D.location.proxy_pass.address}${D.location.proxy_pass.port ? ':' + D.location.proxy_pass.port : ''};\n`
        }
      } else if (p === 'proxy_redirect' || p === 'proxy_buffering' || p === 'proxy_ssl_verify') {
        config += `\t\t${p} ${D.location[p] === true ? 'on' : 'off'};\n`
      } else if (p === 'proxy_set_header') {
        Object.keys(D.location.proxy_set_header).forEach(h => {
          config += `\t\tproxy_set_header ${h} ${D.location.proxy_set_header[h]};\n`
        })
      } else {
        if (p !== 'path' && p !== 'template') {
          config += `\t\t${p} ${D.location[p]};\n`
        }
      }
    })

    config += '\t}\n'

    config += '}'
    fs.writeFileSync(`${this.NGINX_FOLDER}/sites-available/${domain}`, config)
    var exists = true
    try {
      fs.lstatSync(`${this.NGINX_FOLDER}/sites-enabled/${domain}`)
    } catch (e) {
      exists = false
    }
    var response = null
    if (D.enabled) {
      if (!exists) {
        fs.symlinkSync(`../sites-available/${domain}`, `${this.NGINX_FOLDER}/sites-enabled/${domain}`)
        response = wait.for.promise(nginx.test())
        if (response === 'OK') {
          response = wait.for.promise(nginx.reload())
          this.responses[domain] = response
          if (response !== 'OK') {
            console.log('Error: ' + response)
            ret = false
          }
        } else {
          this.responses[domain] = 'Invalid Nginx configuration.'
        }
      }
    } else {
      if (exists) {
        fs.unlinkSync(`${this.NGINX_FOLDER}/sites-enabled/${domain}`)
        response = wait.for.promise(nginx.test())
        if (response === 'OK') {
          response = wait.for.promise(nginx.reload())
          this.responses[domain] = response
          if (response !== 'OK') {
            console.log('Error: ' + response)
            ret = false
          }
        } else {
          this.responses[domain] = 'Invalid Nginx configuration.'
        }
      }
    }
    return ret
  }

  /**
   * Write all configurations to disk. Returns
   * false if any domains failed to write configuration.
   * @returns {boolean}
   */
  writeConfigs () {
    this.responses = {}
    var ret = true
    Object.keys(this.domainsDict).forEach(domain => {
      ret = ret && this.writeConfig(domain)
    })
    return ret
  }
}
