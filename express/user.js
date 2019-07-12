/*jslint es6 node:true */
"use strict";

const md5 = require('md5');
const express = require('express');
const router = express.Router();

const PASSWD = require('../passwd');

router.get('/login', (req, res) => {
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    res.render('login', {
        errorMessage: errorMessage,
        VERSION: process.env.VERSION
    });
});

router.post('/login', (req, res) => {
    req.session.errorMessage = undefined;
    if (!PASSWD[req.body.user]) {
        req.session.errorMessage = 'Unknown user!';
        return res.redirect('/login');
    }
    if (PASSWD[req.body.user]['password'] !== md5(req.body.password)) {
        req.session.errorMessage = 'Invalid password!';
        return res.redirect('/login');
    }
    if (req.session.user === undefined) {
        req.session.user ={
            name: req.body.user,
            isAdmin: PASSWD[req.body.user].isAdmin
        };
    }
    res.redirect('/');
});

router.get('/logout', (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

module.exports = router;
