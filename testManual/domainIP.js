/*jslint es6 node:true */
"use strict";

process.env.NODE_ENV = 'test';

const Dig = require('../modules/dig');
const dig1 = new Dig('krneki.mambix.com');
console.log(dig1.ip());
const dig2 = new Dig('ta.domena.ne.obstaja.com');
console.log(dig2.ip());