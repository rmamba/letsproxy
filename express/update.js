/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');
const Letsproxy = require('../modules/configs/letsproxy');

// router.post('/domain', (req, res) => {
//     if (!req.session.user) {
//         return res.redirect(401, '/login');
//     }
//     var errorMessage = req.session.errorMessage;
//     req.session.errorMessage = undefined;
//     var domains = helper.config.domains.json();
//     if (!domains.hasOwnProperty(req.params.domain)) {
//         req.session.errorMessage = 'Unknown domain!!!';
//         return res.redirect('/domains');
//     }
//     res.render('domain', {
//         user: req.session.user !== undefined?req.session.user.name:false,
//         errorMessage: errorMessage,
//         domain: domains[req.params.domain],
//         externalDomain: req.params.domain
//     });
// });

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