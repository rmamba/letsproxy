/*jslint es6 node:true */
"use strict";

const fs = require('fs');
const Acme = require('../system/acmetool');
const acme = new Acme();
const Wget = require('../wget');
module.exports = class Acme {
    constructor() {
        this.domains = {};
        this.checks = {};
        this.responses = {};
        this.errors = {};
        if (fs.existsSync('./config/frontends.json')) {
            this.domains = JSON.parse(fs.readFileSync('./config/frontends.json').toString());
        }
    }

    write_config(domain) {
        this.responses[domain] = undefined;
        this.checks[domain] = undefined;
        if (this.domains.hasOwnProperty(domain)) {
            var domainConfig = this.domains[domain];
            var domains = [domain];

            if (domainConfig.aliases) {
                domains = domains.concat(domainConfig.aliases);
            }

            var config = 'satisfy:\n  names:\n';
            domains.forEach(d => {
                config += `  - ${d}\n`;
            });
            fs.writeFileSync(`./acme/desired/${domain}`, config);

            if (domainConfig.enabled === true) {
                const wget = new Wget();
                const check = wget.data(false, `${domain}/.well-known/acme-challenge/test`);
                this.checks[domain] = check;
                if (check === 'working!!!') {
                    this.responses[domain] = acme.want(domains.join(' '));
                    return true;
                }
            }
        }
        this.responses[domain] = `Domain '${domain}' not found.`;
        return false;
    }

    write_configs() {
        this.responses = {};
        this.checks = {};
        var ret = true;
        Object.keys(this.domains).forEach(domain => {
            ret = ret & this.write_config(domain);
        });
        return ret;
    }
}
