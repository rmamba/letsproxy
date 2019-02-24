/*jslint es6 node:true */
"use strict";

const wait = require('wait-for-stuff');

module.exports = class Wget {
    constructor() {
        this.request = require('request');
    }

    data(https, www) {
        const options = {
            url: `http${https?'s':''}://${www}`,
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/10.0' }
        };
        const R = this.request;
        var P = new Promise(function(resolve, reject){
            R.get(options, function (error, response, body) {
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
    
    binary(https, www) {
        const options = {
            url: `http${https?'s':''}://${www}`,
            method: 'GET',
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
    
    favicon(https, www) {
        const re = /<link.*?rel="icon".*?>/g;
        const options = {
            hostname: www,
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
}