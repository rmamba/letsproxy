/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const test = require('tap').test
const Acme = require('../../modules/configs/acme')

test('Empty init', function (t) {
  t.throws(function () {
    // eslint-disable-next-line no-new
    new Acme()
  }, new Error('Missing domain.'), 'Should NOT throw error')
  t.end()
})
