/*jslint es6 node:true */
"use strict";

const fs = require('fs');
const { exec } = require('child_process');
const express = require('express');
const router = express.Router();
const helper = require('../modules/helper');
const faviconFolder = './cache/favicon'
const ConfigFavicons = require('../modules/configs/favicons');
const Wget = require('../modules/wget');
const mime = {
    ico: 'image/x-icon',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml'
};

router.get('/config/:domain', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var data = '{\n\t"error": "No config found!!!"\n}';
    if (fs.existsSync(`./nginx/sites-available/${req.params.domain}`)) {
        data = fs.readFileSync(`./nginx/sites-available/${req.params.domain}`).toString();
    }
    // res.header();
    res.end(data);
});

router.get('/favicon/:protocol/:url', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }
    var data;
    const configFavicons = new ConfigFavicons();
    if (configFavicons.hasOwnProperty(req.params.url)) {
        if (fs.existsSync(`${faviconFolder}/${configFavicons.faviconsDict[req.params.url].fileName}`)) {
            data = fs.readFileSync(`${faviconFolder}/${configFavicons.faviconsDict[req.params.url].fileName}`);
            res.set('Content-Type', configFavicons.faviconsDict[req.params.url].contentType);
            res.end(data, 'binary');
            return;
        }
    }
    const wget = new Wget();
    var favicon = wget.favicon(req.params.protocol==='https'?true:false, req.params.url);
    if (favicon === undefined) {
        return res.redirect('/domains');
    }
    data = wget.binary(req.params.protocol==='https'?true:false, favicon);
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
    configFavicons.faviconsDict[req.params.url] = {
        fileName: fileName,
        contentType: contentType,
        lastUpdated: new Date()
    };
    configFavicons.save();
    res.set('Content-Type', contentType);
    res.end(data, 'binary');
});

router.get('/nginx/test', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }

    exec('nginx -t', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.log(err);
          return res.end('ERROR');
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stderr.indexOf('syntax is ok') > 0) {
            res.end('OK');
        } else {
            res.end('ERROR');
        }
    });
});

router.get('/nginx/reload', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }

    exec('nginx -s reload', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.log(err);
          return res.end('ERROR');
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stderr === '') {
            res.end('OK');
        } else {
            res.end('ERROR');
        }
    });
});

router.get('/nginx/stop', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }

    exec('nginx -s stop', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.log(err);
          return res.end('ERROR');
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stderr.indexOf('error') === -1) {
            res.end('OK');
        } else {
            res.end('ERROR');
        }
    });
});

router.get('/nginx/start', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }

    exec('nginx', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.log(err);
          return res.end('ERROR');
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stderr.indexOf('nginx: [emerg]') === -1) {
            res.end('OK');
        } else {
            res.end('ERROR');
        }
    });
});

router.get('/nginx/running', (req, res) => {
    if (!req.session.user) {
        return res.redirect(401, '/login');
    }

    exec('ps waux | grep nginx', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          console.log(err);
          return res.end('ERROR');
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stdout.indexOf('master process nginx') > 0) {
            res.end('RUNNING');
        } else {
            res.end('STOPED');
        }
    });
});

module.exports = router;