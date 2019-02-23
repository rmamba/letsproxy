/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');

router.get('/domains', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    var domains = helper.config.domains.array();
    res.render('domains', {
        user: req.session.user !== undefined?req.session.user:false,
        errorMessage: errorMessage,
        domains: domains
    });
});

router.get('/servers', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    var servers = helper.config.servers.array();
    res.render('servers', {
        user: req.session.user !== undefined?req.session.user:false,
        errorMessage: errorMessage,
        servers: servers
    });
});

module.exports = router;