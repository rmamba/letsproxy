/*jslint es6 node */
"use strict";

process.env.NODE_ENV = 'test';

const fs = require('fs');
const express = require('express');
const session = require('cookie-session');
const app = express();
const version = require('./version');
const ConfigLetsproxy = require('./modules/configs/letsproxy');
const configLetsproxy = new ConfigLetsproxy();

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

const PORT = process.env.PORT || 3000;
module.exports = app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));