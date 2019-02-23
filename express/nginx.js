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
        user: req.session.user !== undefined?req.session.user.name:false,
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
        user: req.session.user !== undefined?req.session.user.name:false,
        errorMessage: errorMessage,
        servers: servers
    });
});

router.get('/add/domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    res.render('domain', {
        user: req.session.user !== undefined?req.session.user.name:false,
        errorMessage: errorMessage,
        domain: {}
    });
});

router.get('/add/server', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    res.render('server', {
        user: req.session.user !== undefined?req.session.user.name:false,
        errorMessage: errorMessage,
        domain: {}
    });
});

router.get('/edit/domain/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    var domains = helper.config.domains.json();
    if (!domains.hasOwnProperty(req.params.domain)) {
        req.session.errorMessage = 'Unknown domain!!!';
        return res.redirect('/domains');
    }
    res.render('domain', {
        user: req.session.user !== undefined?req.session.user.name:false,
        errorMessage: errorMessage,
        domain: domains[req.params.domain],
        externalDomain: req.params.domain
    });
});

router.get('/edit/server/:server', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    var domains = helper.config.domains.json();
    if (!domains.hasOwnProperty(req.params.domain)) {
        req.session.errorMessage = 'Unknown domain!!!';
        return res.redirect('/domains');
    }
    res.render('server', {
        user: req.session.user !== undefined?req.session.user.name:false,
        errorMessage: errorMessage,
        domain: domains[req.params.domain],
        externalDomain: req.params.domain
    });
});

module.exports = router;