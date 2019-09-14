/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const test = require('tap').test
const Nginx = require('../../modules/configs/nginx')

test('Empty init', function (t) {
  t.doesNotThrow(function () {
    // eslint-disable-next-line no-new
    new Nginx()
  }, 'Should NOT throw error')
  t.end()
})

test('setLocationProperties', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('assignTemplate', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('domainsAsArray', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('usedUpstreamsAsArray', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
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
