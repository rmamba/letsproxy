/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const test = require('tap').test
const Nginx = require('../../modules/system/nginx')

test('Empty init', function (t) {
  t.throws(function () {
    // eslint-disable-next-line no-new
    new Nginx()
  }, new Error('Missing domain.'), 'Should NOT throw error')
  t.end()
})
