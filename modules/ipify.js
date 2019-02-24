/*jslint es6 node:true */
"use strict";

module.exports = class Ipify {
    constructor() {
    }

    ip() {
        var response = module.exports.request.get('https://api.ipify.org/?format=json');
        return response.ip;
    }
}