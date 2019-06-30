/*jslint es6 node:true */
"use strict";

const fs = require('fs');
const Acme = require('../system/acmetool');
const acme = new Acme();

module.exports = class Acme {
    constructor() {
        this.domains = {};
        if (fs.existsSync('./config/frontends.json')) {
            this.domains = JSON.parse(fs.readFileSync('./config/frontends.json').toString());
        }
    }

    write_config(domain) {
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

            acme.want(domains.join(' '));
        }
    }

    write_configs() {
        Object.keys(this.domains).forEach(domain => {
            this.write_config(domain);
        });
    }
}
