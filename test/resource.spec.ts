/// <reference path='typings/globals.d.ts' />

import resourceGenerator from '../src/resource'

describe('Resource', () => {
  let client
  let resourceFactory
  let resource

  before (() => {
    resourceFactory = resourceGenerator(client)
  })

  describe('Rsource instantiation', () => {
    it('exposes basic CRUD API', () => {
      client = { request: sinon.spy() }

      resource = resourceFactory('/mock-base')

      expect(resource)
        .to.include.all.keys('list', 'get', 'edit', 'del')
    })

    it('can be extended with additional methods', () => {
      client = { request: sinon.spy() }

      resourceFactory = resourceGenerator(client)

      resource = resourceFactory('/mock-base', undefined, { extraMethod: () => {} })

      expect(resource)
        .to.include.all.keys('list', 'get', 'edit', 'del', 'extraMethod')
    })

    it('can limit exposed default methods', () => {
      client = { request: sinon.spy() }

      resourceFactory = resourceGenerator(client)

      resource = resourceFactory('/mock-base', ['list', 'get'])

      expect(resource)
        .to.include.all.keys('list', 'get')
    })
  })
})
