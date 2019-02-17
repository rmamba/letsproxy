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