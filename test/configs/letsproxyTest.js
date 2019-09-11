/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const test = require('tap').test
const Letsproxy = require('../../modules/configs/letsproxy')

test('Empty init', function (t) {
  t.throws(function () {
    // eslint-disable-next-line no-new
    new Letsproxy()
  }, new Error('Missing domain.'), 'Should NOT throw error')
  t.end()
})
