/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const test = require('tap').test
const Letsproxy = require('../../modules/configs/letsproxy')

test('Empty init', function (t) {
  t.doesNotThrow(function () {
    // eslint-disable-next-line no-new
    new Letsproxy()
  }, 'Should NOT throw error')
  t.end()
})

test('writeConfigs', function (t) {
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

test('writeUpstream', function (t) {
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

test('updateUpstream', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('removeUpstream', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('removeDomain', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('renameUpstream', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('replaceUpstream', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('usedUpstreams', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('parseDomain', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('updateDomain', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})

test('writeDomains', function (t) {
  t.doesNotThrow(function () {
    t.fail('Not tested.')
  }, 'Should NOT throw error')
  t.end()
})
