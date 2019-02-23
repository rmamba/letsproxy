/*jslint es6 node:true */
"use strict";

const fs = require('fs');
const CONFIG = require('../../config');
const Acme = require('./acme');
const Nginx = require('./nginx');

module.exports = class Letsproxy {
    constructor() {
        this.domainsDict = {}
        this.backendsDict = {}
        if (fs.existsSync('./backends.json')) {
            this.backendsDict = JSON.parse(fs.readFileSync('./backends.json').toString());
        } else {
            this.write_upstream();
        }
        if (fs.existsSync('./frontends.json')) {
            this.domainsDict = JSON.parse(fs.readFileSync('./frontends.json').toString());
        } else {
            this.write_domains();
        }
    }

    write_configs() {
        const acme = new Acme();
        acme.write_configs();
        const nginx = new Nginx();
        nginx.write_configs();
    }

    write_upstream() {
        fs.writeFileSync('./backends.json', JSON.stringify(this.backendsDict, null, 2));
        this.write_configs();
    }

    update_upstream(name, servers) {
        if (!(servers instanceof Array)) {
            throw new Error('Servers argument must be Array.');
        }
        if (servers.length === 0) {
            throw new Error('Servers argument can not be empty Array.');
        }
        servers.forEach(server => {
            if (!server.hasOwnProperty('address')) {
                throw new Error('Server must have address property.');
            }
            if (server.address === '') {
                throw new Error('Address property can not be empty string.');
            }
            if (!server.hasOwnProperty('port')) {
                throw new Error('Server must have port property.');
            }
            if (server.port === '') {
                throw new Error('Port property can not be empty.');
            }
        });
        this.backendsDict[name] = {
            servers: servers
        };
    }

    remove_upstream(name) {
        if (!this.backendsDict.hasOwnProperty(name)) {
            throw new Error(`Upstream '${name}' not found.`);
        }
        delete this.backendsDict[name];
    }

    rename_upstream(oldName, newName) {
        if (this.backendsDict.hasOwnProperty(oldName)) {
            delete this.backendsDict[oldName];
        }
        Object.keys(this.domainsDict).forEach(domain => {
            if (this.domainsDict[domain].location.proxy.pass.backend === oldName) {
                this.domainsDict[domain].location.proxy.pass.backend = newName;
            }
        });
    }

    write_domains() {
        fs.writeFileSync('./frontends.json', JSON.stringify(this.domainsDict, null ,2));
        this.write_configs();
    }
}