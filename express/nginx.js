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
    res.render('domains', {
        errorMessage: errorMessage,
        domains: helper.config.domains.array()
    });
});

module.exports = router;