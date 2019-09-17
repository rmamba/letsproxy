/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const fs = require('fs')
const test = require('tap').test
const Nginx = require('../../modules/configs/nginx')

test('Empty init', function (t) {
  t.doesNotThrow(function () {
    const nginx = new Nginx()
    t.same(nginx.domainsDict, JSON.parse(fs.readFileSync(nginx.FRONTEND_CONFIG).toString()))
    t.same(nginx.backendsDict, JSON.parse(fs.readFileSync(nginx.BACKEND_CONFIG).toString()))
    t.same(nginx.IGNORE, ['aliases', 'enabled', 'path', 'template', 'location', 'httpRedirect'])
  }, 'Should NOT throw error')
  t.end()
})

test('setServerProperties #1', function (t) {
  t.doesNotThrow(function () {
    const nginx = new Nginx()
    const ret = nginx.setServerProperties('krneki.com', null)
    t.equal(ret, false)
  }, 'Should NOT throw error')
  t.end()
})

test('setServerProperties #2', function (t) {
  t.doesNotThrow(function () {
    const nginx = new Nginx()
    const ret = nginx.setServerProperties('test.example.com', { testProperty: 'testValue' })
    t.equal(ret, true)
    t.same(nginx.domainsDict['test.example.com'].testProperty, 'testValue')
  }, 'Should NOT throw error')
  t.end()
})

test('setLocationProperties #1', function (t) {
  t.doesNotThrow(function () {
    const nginx = new Nginx()
    const ret = nginx.setLocationProperties('krneki.com', null)
    t.equal(ret, false)
  }, 'Should NOT throw error')
  t.end()
})

test('setLocationProperties #2', function (t) {
  t.doesNotThrow(function () {
    const nginx = new Nginx()
    const ret = nginx.setLocationProperties('test.example.com', { testProperty: 'testValue' })
    t.equal(ret, true)
    t.same(nginx.domainsDict['test.example.com'].location.testProperty, 'testValue')
  }, 'Should NOT throw error')
  t.end()
})

test('setLocationProperties #3', function (t) {
  t.doesNotThrow(function () {
    const nginx = new Nginx()
    delete nginx.domainsDict['test.example.com'].location
    const ret = nginx.setLocationProperties('test.example.com', { testProperty: 'testValue' })
    t.equal(ret, true)
    t.same(nginx.domainsDict['test.example.com'].location, { testProperty: 'testValue' })
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
