/*jslint es6 node:true */
"use strict";

const fs = require('fs');
const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');
const faviconFolder = './cache/favicon'
const mime = {
    ico: 'image/x-icon',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml'
};

router.get('/favicon/:protocol/:url', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var data;
    var favicons = helper.config.favicons.json();
    if (favicons.hasOwnProperty(req.params.url)) {
        if (fs.existsSync(`${faviconFolder}/${favicons[req.params.url].fileName}`)) {
            data = fs.readFileSync(`${faviconFolder}/${favicons[req.params.url].fileName}`);
            res.set('Content-Type', favicons[req.params.url].contentType);
            res.end(data, 'binary');
            return;
        }
    }
    var favicon = helper.request.favicon(req.params.protocol==='https'?true:false, req.params.url);
    if (favicon === undefined) {
        return res.redirect('/domains');
    }
    data = helper.request.getImage(req.params.protocol==='https'?true:false, favicon);
    if (data instanceof Error) {
        console.log(data);
        data = fs.readFileSync(`${faviconFolder}/favicon.ico`);
        res.set('Content-Type', contentType);
        res.end(data, 'binary');
    }
    var parts = favicon.split('.');
    var iconType = parts[parts.length-1];
    var fileName = `${helper.domain.to.backend(req.params.url)}.${iconType}`;
    var contentType = 'image/x-icon';
    if (mime.hasOwnProperty(iconType)) {
        contentType = mime[iconType];
    }
    fs.writeFileSync(`${faviconFolder}/${fileName}`, data, 'binary');
    favicons[req.params.url] = {
        fileName: fileName,
        contentType: contentType,
        lastUpdated: new Date()
    };
    helper.config.favicons.save(favicons);
    res.set('Content-Type', contentType);
    res.end(data, 'binary');
});

module.exports = router;