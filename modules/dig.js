/*jslint es6 node:true */
"use strict";

const wait = require('wait-for-stuff');

module.exports = class Dig {
    constructor(domain) {
        if (domain === undefined) {
            throw new Error('Missing domain.');
        }
        if (domain === '') {
            throw new Error('Empty domain.');
        }
        if (typeof(domain) !== 'string') {
            throw new Error('Must be string.');
        }
        this.dig = require('node-dig-dns');
        this.domain = domain;
    }

    promiseA() {
        const DIG = this.dig;
        const options = ['@8.8.8.8', this.domain, 'A'];
        return new Promise(function(resolve, reject){
            DIG(options).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err);
            });
        });
    }

    ip() {
        var pA = this.promiseA();
        var response = wait.for.promise(pA);
        if (response instanceof Error) {
            throw new response;
        }
        var ip = undefined;
        if (!response.answer) {
            return ip;
        }
        var domains = {};
        response.answer.forEach(answer => {
            domains[answer.domain] = answer.value;
        });
        ip = `${this.domain}.`;
        while (domains.hasOwnProperty(ip)) {
            ip = domains[ip];
        }
        if (ip === '92.242.132.24' || ip === `${this.domain}.`) {
            ip = undefined;
        }
        return ip;
    }
}