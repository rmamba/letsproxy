/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const test = require('tap').test
const Acmetool = require('../../modules/system/acmetool')

test('Empty init', function (t) {
  t.throws(function () {
    // eslint-disable-next-line no-new
    new Acmetool()
  }, new Error('Missing domain.'), 'Should NOT throw error')
  t.end()
})
