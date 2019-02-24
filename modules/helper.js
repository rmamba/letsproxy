/*jslint es6 node:true */
"use strict";

const fs = require('fs');

module.exports.domain = {
    to: {}
};
module.exports.domain.to.backend = function domains2backend(domain) {
    return domain.replace(/\./g, '-');
};

module.exports.config = {
    domains: {},
    favicons: {},
    servers: {}
};

module.exports.config.domains.json = function domainsJSON() {
    var domainsDict = {};
    if (fs.existsSync('./domains.json')) {
        domainsDict = JSON.parse(fs.readFileSync('./domains.json').toString());
    }
    return domainsDict;
};