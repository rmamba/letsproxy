/*jslint es6 node:true */
"use strict";

const fs = require('fs');

module.exports.domain = {
    to: {}
};
module.exports.domain.to.backend = function domains2backend(domain) {
    return domain.replace(/\./g, '-');
};