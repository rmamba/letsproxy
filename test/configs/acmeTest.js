/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const test = require('tap').test
const Acme = require('../../modules/configs/acme')

test('Empty init', function (t) {
  t.doesNotThrow(function () {
    // eslint-disable-next-line no-new
    new Acme()
  }, 'Should NOT throw error')
  t.end()
})

test('writeConfig', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('writeConfigs', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})
