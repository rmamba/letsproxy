/*jslint es6 node */
"use strict";

process.env.NODE_ENV = 'test';

const fs = require('fs');
const express = require('express');
const session = require('cookie-session');
const app = express();
const version = require('./version');
// const helper = require('./modules/helper');
const Letsproxy = require('./modules/configs/letsproxy');
const letsproxy = new Letsproxy();

// const CONFIG = require('./config');
// var FRONTENDS = {};
// var BACKENDS = {};
// if (fs.existsSync('./frontends.json')) {
//     FRONTENDS = JSON.parse(fs.readFileSync('./frontends.json').toString());
// }
// if (fs.existsSync('./backends.json')) {
//     BACKENDS = JSON.parse(fs.readFileSync('./backends.json').toString());
// }

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
        user: req.session.user !== undefined?req.session.user:false
    });
});

const user_v1 = require('./express/user');
const nginx_v1 = require('./express/nginx');
const add_v1 = require('./express/add');
const edit_v1 = require('./express/edit');
const update_v1 = require('./express/update');
const remove_v1 = require('./express/remove');
const ajax_v1 = require('./express/ajax');
app.use('/', user_v1);
app.use('/', nginx_v1);
app.use('/add', add_v1);
app.use('/edit', edit_v1);
app.use('/update', update_v1);
app.use('/remove', remove_v1);
app.use('/ajax', ajax_v1);

// if (!BACKENDS.hasOwnProperty(helper.domain.to.backend(CONFIG.domain))) {
//     BACKENDS[helper.domain.to.backend(CONFIG.domain)] = {
//         servers: [{
//             'address': '127.0.0.1',
//             'port': '3000'
//         }]
//     };
//     fs.writeFileSync('./backends.json', JSON.stringify(BACKENDS, null, 2));
//     const Letsproxy = require('./modules/configs/letsproxy');
//     const letsproxy = new Letsproxy();
//     letsproxy.write_configs();
// }
// if (!FRONTENDS.hasOwnProperty(CONFIG.domain)) {
//     FRONTENDS[CONFIG.domain] = {
//         enabled: true,
//         httpRedirect: true,
//         location: {
//             path: '/',
//             proxy: {
//                 pass: {
//                     https: false,
//                     backend: helper.domain.to.backend(CONFIG.domain)
//                 },
//                 next_upstream: 'error timeout invalid_header http_500 http_502 http_503 http_504',
//                 redirect: false,
//                 buffering: false,
//                 ssl_verify: false,
//                 set_header: {
//                     'Host': '$host',
//                     'X-Real-IP': '$remote_addr',
//                     'X-Forwarded-For': '$proxy_add_x_forwarded_for',
//                     'X-Forwarded-Ssl': 'on'
//                 }
//             }
//         }
//     };
//     fs.writeFileSync('./frontends.json', JSON.stringify(FRONTENDS, null, 2));
//     helper.config.generate();
// }

// if (!fs.existsSync('./nginx/sites-available/letsproxy')) {
//     const Letsproxy = require('./modules/configs/letsproxy');
//     const letsproxy = new Letsproxy();
//     letsproxy.write_configs();
// }

const PORT = process.env.PORT || 3000;
module.exports = app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));