/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const ConfigProxy = require('../modules/configs/letsproxy');
const ConfigNginx = require('../modules/configs/nginx');

router.get('/domains', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const configNginx = new ConfigNginx();
    res.render('domains', {
        user: req.session.user !== undefined?req.session.user:false,
        errorMessage: errorMessage,
        domains: configNginx.domainsAsArray(),
        hasBackends: Object.keys(configNginx.backendsDict).length > 0
    });
});

router.get('/servers', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const configNginx = new ConfigNginx();
    res.render('servers', {
        user: req.session.user !== undefined?req.session.user:false,
        errorMessage: errorMessage,
        servers: configNginx.backendsDict,
        usedUpstreams: configNginx.usedUpstreamsAsArray()
    });
});

router.get('/domain/enable/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigProxy();
    if (!configLetsproxy.domainsDict.hasOwnProperty(req.params.domain)) {
        req.session.errorMessage = 'Domain not found.';
        return res.redirect('/domains');
    }
    configLetsproxy.domainsDict[req.params.domain].enabled = true;
    configLetsproxy.write_domains();
    configLetsproxy.write_config(req.params.domain);
    res.redirect('/domains');
});

router.get('/domain/disable/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigProxy();
    if (!configLetsproxy.domainsDict.hasOwnProperty(req.params.domain)) {
        req.session.errorMessage = 'Domain not found.';
        return res.redirect('/domains');
    }
    configLetsproxy.domainsDict[req.params.domain].enabled = false;
    configLetsproxy.write_domains();
    configLetsproxy.write_config(req.params.domain);
    res.redirect('/domains');
});

router.get('/domain/redirect/enable/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigProxy();
    if (!configLetsproxy.domainsDict.hasOwnProperty(req.params.domain)) {
        req.session.errorMessage = 'Domain not found.';
        return res.redirect('/domains');
    }
    configLetsproxy.domainsDict[req.params.domain].httpRedirect = true;
    configLetsproxy.write_domains();
    configLetsproxy.write_config(req.params.domain);
    res.redirect('/domains');
});

router.get('/domain/redirect/disable/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigProxy();
    if (!configLetsproxy.domainsDict.hasOwnProperty(req.params.domain)) {
        req.session.errorMessage = 'Domain not found.';
        return res.redirect('/domains');
    }
    configLetsproxy.domainsDict[req.params.domain].httpRedirect = false;
    configLetsproxy.write_domains();
    configLetsproxy.write_config(req.params.domain);
    res.redirect('/domains');
});

module.exports = router;