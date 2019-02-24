/*jslint es6 node:true */
"use strict";

const fs = require('fs');
const CONFIG = require('../../config');

module.exports = class Nginx {
    constructor() {
        this.domainsDict = {};
        this.backendsDict = {}
        if (fs.existsSync('./frontends.json')) {
            this.domainsDict = JSON.parse(fs.readFileSync('./frontends.json').toString());
        }
        if (fs.existsSync('./backends.json')) {
            this.backendsDict = JSON.parse(fs.readFileSync('./backends.json').toString());
        }
    }

    domainsAsArray() {
        var domainsArray = [];
        Object.keys(this.domainsDict).forEach(domain => {
            var domainData = this.domainsDict[domain];
            domainData.certificates = fs.existsSync(`/var/lib/acme/live/${domain}/fullchain`);
            var data = {
                name: domain,
                settings: domainData,
                backend: this.backendsDict[domainData.location.proxy.pass.backend],
                backendName: domainData.location.proxy.pass.backend,
                httpRedirect: domainData.httpRedirect
            };
            domainsArray.push(data);
        });
        return domainsArray;
    };

    write_config(domain) {
        var D = this.domainsDict[domain];
        var config = '';
        var domains = domain.toLowerCase();
        if (D.aliases) {
            domains += `,${D.aliases.join()}`;
        }
        config += `server {\n`;
        config += `\tlisten 80;\n`;
        config += `\tserver_name ${domains};\n`;

        // #ACME
        config += `\n\tlocation ^~ /.well-known/acme-challenge/ {\n`;
        config += `\t\tallow all;\n`;
        config += `\t\tdefault_type "text/plain";\n`;
        config += `\t\talias ${CONFIG.acme.challenge}/;\n`;
        config += `\t}\n`;
        config += `\t\n\tlocation = /.well-known/acme-challenge/ {\n`;
        config += `\t\treturn 404;\n`;
        config += `\t}\n`;

        if (D.httpRedirect === true) {
            config += `\n\tlocation / {\n`;
            config += `\t\treturn 301 https://$host$request_uri;\n`;
            config += `\t}\n`;
        }

        config += `}\n`;

        if (D.location.proxy.pass.backend !== undefined) {
            config += `\nupstream ${D.location.proxy.pass.backend} {\n`;
            this.backendsDict[D.location.proxy.pass.backend].servers.forEach(server => {
                config += `\tserver ${server.address}`;
                if (server.port) {
                    config += `:${server.port}`;
                }
                if (server.extra) {
                    config += ` ${server.extra}`;
                }
                config += ';\n';
            });
            config += `}\n`;
        }

        config += `\nserver {\n`;
        config += `\tlisten 443;\n`;
        config += `\tserver_name ${domain.toLowerCase()};\n`;
        config += `\taccess_log /var/log/nginx/${domain.toLowerCase()}.access.log;\n`;
        config += `\terror_log /var/log/nginx/${domain.toLowerCase()}.error.log;\n`;

        if (fs.existsSync(`${CONFIG.acme.certificates}/${domain.toLowerCase()}/fullchain`)) {
            config += `\tssl_dhparam ${CONFIG.nginx}/dhparam.pem;\n`;
            config += `\tssl_certificate ${CONFIG.acme.certificates}/${domain.toLowerCase()}/fullchain;\n`;
            config += `\tssl_certificate_key ${CONFIG.acme.certificates}/${domain.toLowerCase()}/privkey;\n`;
        }

        config += `\t\n\tlocation ${D.location.path} {\n`;
        Object.keys(D.location.proxy).forEach(p => {
            if (p === 'pass') {
                if (D.location.proxy.pass.backend) {
                    config += `\t\tproxy_pass http${D.location.proxy.pass.https?'s':''}:\/\/${D.location.proxy.pass.backend};\n`;
                } else {
                    config += `\t\tproxy_pass http${D.location.proxy.pass.https?'s':''}:\/\/${D.location.proxy.pass.address}${D.location.proxy.pass.port?':'+D.location.proxy.pass.port:''};\n`;
                }
            } else if (p === 'redirect' || p === 'buffering' || p === 'ssl_verify') {
                config += `\t\tproxy_${p} ${D.location.proxy[p]===true?'on':'off'};\n`;
            } else if (p === 'set_header') {
                Object.keys(D.location.proxy.set_header).forEach(h => {
                    config += `\t\tproxy_set_header ${h} ${D.location.proxy.set_header[h]};\n`;
                });
            } else {
                config += `\t\tproxy_${p} ${D.location.proxy[p]};\n`;
            }
        });
        config += `\t}\n`;

        config += `}`;
        fs.writeFileSync(`./nginx/sites-available/${domain}`, config);
        var exists = true;
        try {
            fs.lstatSync(`./nginx/sites-enabled/${domain}`);
        } catch(e) {
            exists = false;
        }
        if (D.enabled) {
            if (!exists) {
                fs.symlinkSync(`../sites-available/${domain}`, `./nginx/sites-enabled/${domain}`);
            }1
        } else {
            if (exists) {
                fs.unlinkSync(`./nginx/sites-enabled/${domain}`);
            }
        }
    };

    write_configs() {
        Object.keys(this.domainsDict).forEach(domain => {
            this.write_config(domain);
        });
    }
}