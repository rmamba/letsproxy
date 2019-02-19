/*jslint es6 node */
"use strict";

process.env.NODE_ENV = 'test';

const fs = require('fs');
const express = require('express');
const session = require('cookie-session');
const app = express();
const version = require('./version');
const helper = require('./modules/helper');

const CONFIG = require('./config');
var DOMAINS = {};
if (fs.existsSync('./domains.json')) {
    DOMAINS = JSON.parse(fs.readFileSync('./domains.json').toString());
}

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    name: 'letsproxy_session', 
    secret: 'keyboard cat',
    maxAge: 24 * 60 * 60 * 1000 * 1
}))
app.set('view engine', 'pug');
app.use(express.static('static'));

if (process.env.NodeDB_COMPRESSION === 'true') {
    const compression = require('compression');
    function shouldCompress(req, res) {
        if (req.headers['x-no-compression']) {
            // don't compress responses with this request header
            return false;
        }

        // fallback to standard filter function
        return compression.filter(req, res);
    }
    app.use(compression({filter: shouldCompress}));
}
// app.set('json spaces', 2);

app.get('/', (req, res) => {
    req.session.errorMessage = undefined;
    res.render('index', {
        user: req.session.user !== undefined?req.session.user.name:false
    });
});

const user_v1 = require('./express/user');
const nginx_v1 = require('./express/nginx');
app.use('/', user_v1);
app.use('/', nginx_v1);

if (!DOMAINS.hasOwnProperty(CONFIG.domain)) {
    DOMAINS[CONFIG.domain] = {
        enabled: true,
        httpRedirect: true,
        location: {
            path: '/',
            proxy: {
                pass: {
                    https: false,
                    address: '127.0.0.1',
                    port: 3000
                },
                next_upstream: 'error timeout invalid_header http_500 http_502 http_503 http_504',
                redirect: false,
                buffering: false,
                ssl_verify: false,
                set_header: {
                    'Host': '$host',
                    'X-Real-IP': '$remote_addr',
                    'X-Forwarded-For': '$proxy_add_x_forwarded_for',
                    'X-Forwarded-Ssl': 'on'
                }
            }
        }
    };
    fs.writeFileSync('./domains.json', JSON.stringify(DOMAINS, null, 2));
    helper.config.generate();
}

if (!fs.existsSync('./nginx/sites-available/letsproxy')) {
    helper.config.generate();
}

const PORT = process.env.PORT || 3000;
module.exports = app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));