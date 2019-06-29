/*jslint es6 node:true */
"use strict";

const { exec } = require('child_process');

module.exports = class Acmetool {
    constructor() {
        this.SUDO = 'sudo ';
        this.BATCH = '';
    }

    want(domains) {
        return Promise(function(resolve, reject){
            exec(`${this.SUDO}acmetool want ${domains}`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject(err);
                }
              
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                resolve(true);
            });
        });
    }

    run() {
        return new Promise(function(resolve, reject){
            exec(`${this.SUDO}acmetool${this.BATCH}`, (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  reject(err);
                }
              
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                resolve(true);
            });
        });
    }
}
