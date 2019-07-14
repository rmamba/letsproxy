/*jslint es6 node:true */
//@ts-check
"use strict";

const express = require('express');
const router = express.Router();
const ConfigLetsproxy = require('../modules/configs/letsproxy');

router.get('/domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigLetsproxy();
    res.render('domain', {
        user: req.session.user !== undefined?req.session.user:false,
        errorMessage: errorMessage,
        domain: {},
        upstreamServers: Object.keys(configLetsproxy.backendsDict),
        VERSION: process.env.VERSION
    });
});

router.get('/server', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    res.render('server', {
        user: req.session.user !== undefined?req.session.user:false,
        errorMessage: errorMessage,
        upstreamName: null,
        upstreamServers: [{address: null, port: null}],
        VERSION: process.env.VERSION
    });
});

module.exports = router;
