/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');
const ConfigLetsproxy = require('../modules/configs/letsproxy');

router.post('/domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigLetsproxy();

    var data = configLetsproxy.parse_domain(req.body);
    configLetsproxy.update_domain(req.body.externalDomain, data);
    configLetsproxy.write_domains();
    if (req.body.oldExternalDomain !== '' && req.body.oldExternalDomain !== req.body.externalDomain) {
        configLetsproxy.remove_domain(req.body.oldExternalDomain);
    }
    configLetsproxy.write_configs();

    return res.redirect('/domains');
});

router.post('/server', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigLetsproxy();

    if (req.body.oldUpstreamName === '') {
        if (configLetsproxy.backendsDict.hasOwnProperty(req.body.upstreamName)) {
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
    configLetsproxy.update_upstream(req.body.upstreamName, servers);
    if (req.body.oldUpstreamName !== '' && req.body.oldUpstreamName !== req.body.upstreamName) {
        configLetsproxy.rename_upstream(req.body.oldUpstreamName, req.body.upstreamName);
        configLetsproxy.write_upstream();
        configLetsproxy.write_domains();
    } else {
        configLetsproxy.write_upstream();
    }

    return res.redirect('/servers');
});

module.exports = router;
