/*jslint es6 node:true */
"use strict";

const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');
const Letsproxy = require('../modules/configs/letsproxy');

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
//         user: req.session.user !== undefined?req.session.user.name:false,
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
    const letsproxy = new Letsproxy();
    letsproxy.remove_upstream(req.params.server);
    letsproxy.write_upstream();
    return res.redirect('/servers');
});

module.exports = router;