/*jslint es6 node:true */
"use strict";

const fs = require('fs');

module.exports = class Favicons {
    constructor() {
        this.faviconsDict = {};
        if (fs.existsSync('./favicons.json')) {
            this.faviconsDict = JSON.parse(fs.readFileSync('./favicons.json').toString());
        }
    }

    save() {
        fs.writeFileSync('./favicons.json', JSON.stringify(this.faviconsDict, null, 2));
    };
}