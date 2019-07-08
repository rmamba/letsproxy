/*jslint es6 node:true */
"use strict";

const { exec } = require('child_process');

module.exports = class Acmetool {
    constructor() {
        this.SUDO = 'sudo ';
        this.BATCH = '';
    }

    want(domains) {
        const DOMAINS = domains
        const SUDO = this.SUDO;
        return new Promise(function(resolve, reject){
            exec(`${SUDO}acmetool want ${DOMAINS}`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject(err);
                } else {
                    // the *entire* stdout and stderr (buffered)
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                    resolve(true);
                }
            });
        });
    }

    status() {
        const SUDO = this.SUDO;
        return new Promise(function(resolve, reject){
            exec(`${SUDO}acmetool status`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject(err);
                } else {
                    // the *entire* stdout and stderr (buffered)
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                    resolve(true);
                }
            });
        });
    }

    run() {
        const SUDO = this.SUDO;
        const BATCH = this.BATCH;
        return new Promise(function(resolve, reject){
            exec(`${SUDO}acmetool${BATCH}`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject(err);
                } else {
                    // the *entire* stdout and stderr (buffered)
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                    resolve(true);
                }
            });
        });
    }
}
