/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const Letsproxy = require('../modules/configs/letsproxy');

router.get('/domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const letsproxy = new Letsproxy();
    res.render('domain', {
        user: req.session.user !== undefined?req.session.user:false,
        errorMessage: errorMessage,
        domain: {},
        upstreamServers: Object.keys(letsproxy.backendsDict)
    });
});

router.get('/server', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const letsproxy = new Letsproxy();
    res.render('server', {
        user: req.session.user !== undefined?req.session.user:false,
        errorMessage: errorMessage,
        upstreamName: null,
        upstreamServers: [{address: null, port: null}]
    });
});

module.exports = router;