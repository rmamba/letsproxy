/*jslint es6 node:true */
"use strict";

const fs = require('fs');

module.exports.config = {
    domains: {}
};

module.exports.config.domains.array = function domainsToArray() {
    var domainsDict = {};
    if (fs.existsSync('./domains.json')) {
        domainsDict = JSON.parse(fs.readFileSync('./domains.json').toString());
    }
    var domainsArray = [];
    Object.keys(domainsDict).forEach(domain => {
        domainsArray.push({
            name: domain,
            servers: domainsDict[domain].servers
        });
    });
    return domainsArray;
};

module.exports.config.generate = function generateConfig() {
    var domainsDict = {};
    if (fs.existsSync('./domains.json')) {
        domainsDict = JSON.parse(fs.readFileSync('./domains.json').toString());
    }
    Object.keys(domainsDict).forEach(domain => {
        var D = domainsDict[domain];
        var config = '';
        if (D.httpRedirect === true) {
            // var aliases = '';
            // if (D.aliases) {
            //     aliases +=
            // }
            config += `server {\n\tlisten 80;\n\tserver_name ${domain.toLowerCase()};\n\treturn 301 https://$host$request_uri;\n}\n\n`;
        }
        config += `server {\n`;
        config += `\tlisten 443;\n`;
        config += `\tserver_name ${domain.toLowerCase()};\n`;
        config += `\taccess_log /var/log/nginx/${domain.toLowerCase()}.access.log;\n`
        config += `\terror_log /var/log/nginx/${domain.toLowerCase()}.error.log;\n`;

        config += `\tlocation ${D.location.path} {\n`;
        Object.keys(D.location.proxy).forEach(p => {
            if (p === 'pass') {
                config += `\t\tproxy_pass http${D.location.proxy.pass.https?'s':''}:\/\/${D.location.proxy.pass.address}${D.location.proxy.pass.port?':'+D.location.proxy.pass.port:''};\n`;
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
        if (D.enabled) {
            if (!fs.existsSync(`./nginx/sites-enabled/${domain}`)) {
                fs.symlinkSync(`../sites-available/${domain}`, `./nginx/sites-enabled/${domain}`);
            }
        } else {
            if (fs.existsSync(`./nginx/sites-enabled/${domain}`)) {
                fs.unlinkSync(`./nginx/sites-enabled/${domain}`);
            }
        }
    });
};