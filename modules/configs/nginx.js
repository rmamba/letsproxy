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

    set_server_properties(domain, properties) {
        var D = this.domainsDict[domain];
        Object.keys(properties).forEach(property => {
            D[property] = properties[property];
        });
    }

    set_location_properties(domain, properties) {
        var D = this.domainsDict[domain];
        if (!D.hasOwnProperty('location')) {
            D.location = {};
        }
        Object.keys(properties).forEach(property => {
            D.location[property] = properties[property];
        });
    }

    set_proxy_headers(domain, properties) {
        var D = this.domainsDict[domain];
        if (!D.hasOwnProperty('location')) {
            D.location = {};
        }
        if (!D.location.hasOwnProperty('proxy')) {
            D.location.proxy = {};
        }
        if (!D.location.hasOwnProperty('proxy_set_header')) {
            D.location.proxy_set_header = {};
        }
        Object.keys(properties).forEach(property => {
            D.location.proxy_set_header[property] = properties[property];
        });
    }

    assign_template(name) {
        switch(name.toLowerCase()) {
            case 'gitlab':
                this.set_server_properties(domain, {
                    "server_tokens": "off",
                    "ssl_ciphers": '"ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4"',
                    "ssl_protocols": " TLSv1 TLSv1.1 TLSv1.2",
                    "ssl_prefer_server_ciphers": " on",
                    "ssl_session_cache": "shared:SSL:10m",
                    "ssl_session_timeout": "5m"
                });
                this.set_location_properties(domain, {
                    "client_max_body_size": "0",
                    "gzip": "off",
                    "proxy_read_timeout": "300",
                    "proxy_connect_timeout": "300",
                    "proxy_redirect": "off",
                    "proxy_http_version": "1.1"
                });
                this.set_proxy_headers(domain, {
                    "Host": "$http_host",
                    "X-Real-IP": "$remote_addr",
                    "X-Forwarded-Ssl": "on",
                    "X-Forwarded-For": "$proxy_add_x_forwarded_for",
                    "X-Forwarded-Proto": "$scheme"
                });
                break;
            default:
                throw new Error('Unknown template.');
                break;
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
                backend: this.backendsDict[domainData.location.proxy_pass.backend],
                backendName: domainData.location.proxy_pass.backend,
                httpRedirect: domainData.httpRedirect
            };
            domainsArray.push(data);
        });
        return domainsArray;
    };

    write_config(domain) {
        var D = this.domainsDict[domain];

        if (D.gitLab === true) {
            this.assign_template('gitlab');
        }

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

        if (D.location.proxy_pass.backend !== undefined) {
            config += `\nupstream ${D.location.proxy_pass.backend} {\n`;
            this.backendsDict[D.location.proxy_pass.backend].servers.forEach(server => {
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
        Object.keys(D.location).forEach(p => {
            if (p === 'proxy_pass') {
                if (D.location.proxy_pass.backend) {
                    config += `\t\tproxy_pass http${D.location.proxy_pass.https?'s':''}:\/\/${D.location.proxy_pass.backend};\n`;
                } else {
                    config += `\t\tproxy_pass http${D.location.proxy_pass.https?'s':''}:\/\/${D.location.proxy_pass.address}${D.location.proxy_pass.port?':'+D.location.proxy_pass.port:''};\n`;
                }
            } else if (p === 'proxy_redirect' || p === 'proxy_buffering' || p === 'proxy_ssl_verify') {
                config += `\t\t${p} ${D.location[p]===true?'on':'off'};\n`;
            } else if (p === 'proxy_set_header') {
                Object.keys(D.location.proxy_set_header).forEach(h => {
                    config += `\t\tproxy_set_header ${h} ${D.location.proxy_set_header[h]};\n`;
                });
            } else {
                if (p !== 'path') {
                    config += `\t\t${p} ${D.location[p]};\n`;
                }
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