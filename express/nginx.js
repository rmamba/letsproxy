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

router.get('/edit/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var errorMessage = req.session.errorMessage;
    req.session.errorMessage = undefined;
    res.render('edit', {
        user: req.session.user !== undefined?req.session.user.name:false,
        errorMessage: errorMessage,
        domain: {}
    });
});

module.exports = router;