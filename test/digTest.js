/*jslint es6 node:true */
"use strict";

process.env.NODE_ENV = 'test';

const test = require('tap').test;
const Dig = require('../modules/dig');

test('Empty init', function(t) {
    t.throws(function() {
        var dig = new Dig();
    }, new Error('Missing domain.'), 'Should NOT throw error');
    t.end();
});

test('Empty domain', function(t) {
    t.throws(function() {
        var dig = new Dig('');
    }, new Error('Empty domain.'), 'Should NOT throw error');
    t.end();
});

test('Not string', function(t) {
    t.throws(function() {
        var dig = new Dig(123);
    }, new Error('Must be string.'), 'Should NOT throw error');
    t.end();
});

test('existing domain krneki.mambix.com', function(t) {
    t.doesNotThrow(function() {
        var dig = new Dig('krneki.mambix.com');
        var IP = dig.ip();
        t.equal(IP, '80.195.23.126');
    }, 'Should NOT throw error');
    t.end();
});

test('none existing domain tadomenaneobstaja.com', function(t) {
    t.doesNotThrow(function() {
        var dig = new Dig('tadomenaneobstaja.com');
        var IP = dig.ip();
        t.equal(IP, undefined);
    }, 'Should NOT throw error');
    t.end();
});

test('invalid domain tadomenaneobstaja.krneki', function(t) {
    t.doesNotThrow(function() {
        var dig = new Dig('tadomenaneobstaja.krneki');
        var IP = dig.ip();
        t.equal(IP, undefined);
    }, 'Should NOT throw error');
    t.end();
});