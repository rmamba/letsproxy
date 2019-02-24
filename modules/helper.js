/*jslint es6 node:true */
"use strict";

const fs = require('fs');
const wait = require('wait-for-stuff');
const request = require('request');
const CONFIG = require('../config');

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
module.exports.config.favicons.json = function faviconsJSON() {
    var faviconsDict = {};
    if (fs.existsSync('./favicons.json')) {
        faviconsDict = JSON.parse(fs.readFileSync('./favicons.json').toString());
    }
    return faviconsDict;
};

module.exports.config.favicons.save = function faviconsJSON(data) {
    fs.writeFileSync('./favicons.json', JSON.stringify(data, null, 2));
};

module.exports.config.domains.array = function domainsToArray() {
    var domainsDict = {};
    var backendsDict = {};
    if (fs.existsSync('./frontends.json')) {
        domainsDict = JSON.parse(fs.readFileSync('./frontends.json').toString());
    }
    if (fs.existsSync('./backends.json')) {
        backendsDict = JSON.parse(fs.readFileSync('./backends.json').toString());
    }
    var domainsArray = [];
    Object.keys(domainsDict).forEach(domain => {
        var domainData = domainsDict[domain];
        domainData.certificates = fs.existsSync(`/var/lib/acme/live/${domain}/fullchain`);
        var data = {
            name: domain,
            settings: domainData,
            backend: backendsDict[domainData.location.proxy.pass.backend]
        };
        // if (fs.existsSync(`./nginx/sites-available/${domain}`)) {
        //     data.config = fs.readFileSync(`./nginx/sites-available/${domain}`).toString();
        // }
        domainsArray.push(data);
    });
    return domainsArray;
};

module.exports.config.servers.array = function domainsToArray() {
    var backendsDict = {};
    if (fs.existsSync('./backends.json')) {
        backendsDict = JSON.parse(fs.readFileSync('./backends.json').toString());
    }
    return backendsDict;
};

module.exports.request = {};
module.exports.request.get = function requestGet(https, www) {
    console.log(www);
    const options = {
        url: `http${https?'s':''}://${www}`,
        method: 'GET',
        // path: 'ajax_chatinfo?roomid=89757',
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0' }
    };
    var P = new Promise(function(resolve, reject){
        request.get(options, function (error, response, body) {
            if (error) {
                reject(error);
            }
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            resolve(body);
        });
    });

    var response = wait.for.promise(P);
    if (response instanceof Error) {
        throw new response;
    }
    return response;
}

module.exports.request.getImage = function requestImage(https, www) {
    console.log(www);
    const options = {
        url: `http${https?'s':''}://${www}`,
        method: 'GET',
        // path: 'ajax_chatinfo?roomid=89757',
        // headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0' },
        encoding: null
    };
    var P = new Promise(function(resolve, reject){
        request.get(options, function (error, response, body) {
            if (error) {
                reject(error);
            }
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            resolve(body);
        });
    });

    var response = wait.for.promise(P);
    if (response instanceof Error) {
        throw new response;
    }
    return response;
}

module.exports.request.favicon = function getFavicon(https, www) {
    const re = /<link.*?rel="icon".*?>/g;
    const options = {
        hostname: www,
        // path: 'ajax_chatinfo?roomid=89757',
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0' }
    };
    var H = require('http');
    if (https) {
        H = require('https');
    }
    var P = new Promise(function(resolve, reject){
        H.get(options, (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
                var e = re.exec(data);
                if (e) {
                    var m = e[0].match(/href="(.*?)"/gi)
                    resolve(www+m[0].substr(6, m[0].length-7));
                }
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(undefined);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });

    var response = wait.for.promise(P);
    if (response instanceof Error) {
        throw new response;
    }
    return response;
}

module.exports.ipify = {};
//https://api.ipify.org/?format=json
module.exports.ipify.getIP = function getIP() {
    var IP = undefined;
    // var P = new Promise(function(resolve, reject){
    //     https.get('https://api.ipify.org/?format=json', (resp) => {
    //         let data = '';
    //         // A chunk of data has been recieved.
    //         resp.on('data', (chunk) => {
    //             data += chunk;
    //         });

    //         // The whole response has been received. Print out the result.
    //         resp.on('end', () => {
    //             resolve(JSON.parse(data));
    //         });
    //     }).on("error", (err) => {
    //         reject(error);
    //     });
    // });

    // var $response = wait.for.promise(P);
    var response = module.exports.request.get('https://api.ipify.org/?format=json');
    // if (!($response instanceof Error)) {
    //     $IP = $response.ip;
    // }

    return response.ip;
}