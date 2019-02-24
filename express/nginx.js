/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');
const Letsproxy = require('../modules/configs/letsproxy');

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

router.get('/domain/enable/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const letsproxy = new Letsproxy();
    if (!letsproxy.domainsDict.hasOwnProperty(req.params.domain)) {
        req.session.errorMessage = 'Domain not found.';
        return res.redirect('/domains');
    }
    letsproxy.domainsDict[req.params.domain].enabled = true;
    letsproxy.write_domains();
    letsproxy.write_config(req.params.domain);
    res.redirect('/domains');
});

router.get('/domain/disable/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const letsproxy = new Letsproxy();
    if (!letsproxy.domainsDict.hasOwnProperty(req.params.domain)) {
        req.session.errorMessage = 'Domain not found.';
        return res.redirect('/domains');
    }
    letsproxy.domainsDict[req.params.domain].enabled = false;
    letsproxy.write_domains();
    letsproxy.write_config(req.params.domain);
    res.redirect('/domains');
});

module.exports = router;