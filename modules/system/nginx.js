/*jslint es6 node:true */
"use strict";

const { exec } = require('child_process');

module.exports = class Nginx {
    constructor() {
        this.SUDO = 'sudo ';
    }

    start() {
        return new Promise(function(resolve, reject){
            exec(`${SUDO}nginx`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject('ERROR');
                }
              
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                if (stderr.indexOf('nginx: [emerg]') === -1) {
                    resolve('OK');
                } else {
                    resolve('ERROR');
                }
            });
        });
    }

    stop() {
        return new Promise(function(resolve, reject){
            exec(`${SUDO}nginx -s stop`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject('ERROR');
                }
              
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                if (stderr.indexOf('error') === -1) {
                    resolve('OK');
                } else {
                    resolve('ERROR');
                }
            });
        });
    }

    reload() {
        return new Promise(function(resolve, reject){
            exec(`${SUDO}nginx -s reload`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject('ERROR');
                }
              
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                if (stderr === '') {
                    resolve('OK');
                } else {
                    resolve('ERROR');
                }
            });
        });
    }

    test() {
        return new Promise(function(resolve, reject){
            exec(`${this.SUDO}nginx -t`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject('ERROR');
                }
            
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                if (stderr.indexOf('syntax is ok') > 0) {
                    resolve('OK');
                } else {
                    resolve('ERROR');
                }
            });
        });
    }

    running() {
        return new Promise(function(resolve, reject){
            exec('ps waux | grep nginx', (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject('ERROR');
                }
              
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                if (stdout.indexOf('nginx: master process') > 0) {
                    resolve('RUNNING');
                } else {
                    resolve('STOPPED');
                }
            });
        });
    }
}
