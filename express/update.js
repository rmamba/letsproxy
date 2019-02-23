/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');
const Letsproxy = require('../modules/configs/letsproxy');

router.post('/domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    req.session.errorMessage = undefined;
    const letsproxy = new Letsproxy();

    var data = letsproxy.parse_domain(req.body);
    letsproxy.update_domain(req.body.externalDomain, data);
    letsproxy.write_domains();
    if (req.body.oldExternalDomain !== '' && req.body.oldExternalDomain !== req.body.externalDomain) {
        letsproxy.remove_domain(req.body.oldExternalDomain);
        letsproxy.write_configs();
    }

    return res.redirect('/domains');
});

router.post('/server', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    req.session.errorMessage = undefined;
    const letsproxy = new Letsproxy();

    if (req.body.oldUpstreamName === '') {
        if (letsproxy.backendsDict.hasOwnProperty(req.body.upstreamName)) {
            req.session.errorMessage = "Server with this name already exists.";
            return res.redirect('/add/server');
        }
    }

    var servers = [];
    for (let i=0; i<req.body.upstreamAddresses.length; i++) {
        servers.push({
            address: req.body.upstreamAddresses[i],
            port: req.body.upstreamPorts[i]
        });
    }
    letsproxy.update_upstream(req.body.upstreamName, servers);
    if (req.body.oldUpstreamName !== '' && req.body.oldUpstreamName !== req.body.upstreamName) {
        letsproxy.rename_upstream(req.body.oldUpstreamName, req.body.upstreamName);
        letsproxy.write_domains();
    }
    letsproxy.write_upstream();

    return res.redirect('/servers');
});

module.exports = router;