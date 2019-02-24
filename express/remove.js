/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');
const ConfigLetsproxy = require('../modules/configs/letsproxy');

// router.post('/domain/:domain', (req, res) => {
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
//         user: req.session.user !== undefined?req.session.user:false,
//         errorMessage: errorMessage,
//         domain: domains[req.params.domain],
//         externalDomain: req.params.domain
//     });
// });

router.get('/server/:server', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    req.session.errorMessage = undefined;
    const configLetsproxy = new ConfigLetsproxy();
    configLetsproxy.remove_upstream(req.params.server);
    configLetsproxy.write_upstream();
    return res.redirect('/servers');
});

module.exports = router;