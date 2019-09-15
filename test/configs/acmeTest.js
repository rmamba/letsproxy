/* eslint */
'use strict'

process.env.NODE_ENV = 'test'

const fs = require('fs')
const test = require('tap').test
const Acme = require('../../modules/configs/acme')
// const rewiremock = require('rewiremock/node')
const MockedAcmetool = require('../__mock__/acme')
const MockedWget = require('../__mock__/wget')

test('Empty init', function (t) {
  t.doesNotThrow(function () {
    const acme = new Acme()

    const expected = JSON.parse(fs.readFileSync(acme.FRONTEND_CONFIG).toString())
    t.same(acme.domains, expected)
  }, 'Should NOT throw error')
  t.end()
})

test('writeConfig #1', function (t) {
  t.doesNotThrow(function () {
    const acme = new Acme()
    const res = acme.writeConfig('krneki.com')

    t.equal(res, false)
    t.same(acme.responses, { 'krneki.com': "Domain 'krneki.com' not found." })
    t.same(acme.checks, { 'krneki.com': undefined })
  }, 'Should NOT throw error')
  t.end()
})

test('writeConfig #2', function (t) {
  t.doesNotThrow(function () {
    const acme = new Acme()
    acme.acme = new MockedAcmetool()
    acme.wget = new MockedWget()
    const res = acme.writeConfig('letsproxy.mambix.com')

    t.equal(res, true)
    t.same(acme.responses, { 'letsproxy.mambix.com': 'Wished for \'letsproxy.mambix.com www.letsproxy.mambix.com\'.' })
    t.same(acme.checks, { 'letsproxy.mambix.com': 'working!!!' })
    t.same(fs.readFileSync(`${acme.ACME_FOLDER}/letsproxy.mambix.com`).toString(), 'satisfy:\n  names:\n  - letsproxy.mambix.com\n  - www.letsproxy.mambix.com\n')
  }, 'Should NOT throw error')
  t.end()
})

test('writeConfigs', function (t) {
  t.doesNotThrow(function () {
    const acme = new Acme()
    acme.acme = new MockedAcmetool()
    acme.wget = new MockedWget()
    const res = acme.writeConfigs()

    t.equal(res, true)
    t.same(acme.responses, { 'letsproxy.mambix.com': 'Wished for \'letsproxy.mambix.com www.letsproxy.mambix.com\'.', 'test.example.com': undefined })
    t.same(acme.checks, { 'letsproxy.mambix.com': 'working!!!', 'test.example.com': undefined })
    t.same(fs.readFileSync(`${acme.ACME_FOLDER}/letsproxy.mambix.com`).toString(), 'satisfy:\n  names:\n  - letsproxy.mambix.com\n  - www.letsproxy.mambix.com\n')
    t.same(fs.readFileSync(`${acme.ACME_FOLDER}/test.example.com`).toString(), 'satisfy:\n  names:\n  - test.example.com\n')
  }, 'Should NOT throw error')
  t.end()
})
