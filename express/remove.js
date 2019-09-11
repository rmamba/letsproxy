/*jslint es6 node:true */
//@ts-check
"use strict";

const express = require('express');
const router = express.Router();
const ConfigLetsproxy = require('../modules/configs/letsproxy');

router.get('/domain/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigLetsproxy();
    if (configLetsproxy.removeDomain(req.params.domain)) {
        if (!configLetsproxy.writeDomains()) {
            req.session.errorMessage = configLetsproxy.error.message;    
        }
    } else {
        req.session.errorMessage = configLetsproxy.error.message;
    }
    return res.redirect('/domains');
});

router.get('/server/:server', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigLetsproxy();
    configLetsproxy.removeUpstream(req.params.server);
    configLetsproxy.writeUpstream();
    return res.redirect('/servers');
});

module.exports = router;
