/* jslint es6 node */
// @ts-check
'use strict'

const VERSION = require('./version')
console.log(`Letsproxy v${VERSION.version}`)
process.env.VERSION = VERSION.version

const express = require('express')
const cors = require('cors')
const session = require('cookie-session')
const app = express()

app.use(cors({
  origin: 'http://localhost'
}))
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(session({
  name: 'letsproxy_session',
  secret: 'keyboard cat',
  maxAge: 24 * 60 * 60 * 1000 * 1
}))
app.set('view engine', 'pug')
app.use(express.static('static'))

// const compression = require('compression')
// function shouldCompress (req, res) {
//   if (req.headers['x-no-compression']) {
//     // don't compress responses with this request header
//     return false
//   }

//   // fallback to standard filter function
//   return compression.filter(req, res)
// }

// if (process.env.NodeDB_COMPRESSION === 'true') {
//   app.use(compression({ filter: shouldCompress }))
// }
// app.set('json spaces', 2);

app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }

  req.session.errorMessages = []
  req.session.successMessages = []

  res.render('index', {
    user: req.session.user !== undefined ? req.session.user : false,
    VERSION: process.env.VERSION
  })
})

const userV1 = require('./express/user')
const nginxV1 = require('./express/nginx')
const addV1 = require('./express/add')
const editV1 = require('./express/edit')
const updateV1 = require('./express/update')
const removeV1 = require('./express/remove')
const ajaxV1 = require('./express/ajax')
const settingsV1 = require('./express/settings')
const apiUserV1 = require('./express/api/user')
app.use('/', userV1)
app.use('/', nginxV1)
app.use('/add', addV1)
app.use('/edit', editV1)
app.use('/update', updateV1)
app.use('/remove', removeV1)
app.use('/ajax', ajaxV1)
app.use('/settings', settingsV1)
app.use('/api/user', apiUserV1)

const PORT = process.env.PORT || 3000
module.exports = app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))
