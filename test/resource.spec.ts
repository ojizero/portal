/// <reference path='typings/globals.d.ts' />

import resourceGenerator from '../src/resource'

describe('Resource', () => {
  let client
  let resource
  let resourceFactory

  before (() => {
    resourceFactory = resourceGenerator(client)
  })

  describe('Rsource instantiation', () => {
    it('exposes basic CRUD API', () => {
      client = { request: sinon.spy() }

      resource = resourceFactory({ baseRoute: '/mock-base' })

      expect(resource)
        .to.include.all.keys('list', 'get', 'edit', 'del')
    })

    it('can be extended with additional methods', () => {
      client = { request: sinon.spy() }

      resourceFactory = resourceGenerator(client)

      resource = resourceFactory({ baseRoute: '/mock-base', extraMethods: { extraMethod: { path: '/some-path' } } })

      expect(resource)
        .to.include.all.keys('list', 'get', 'edit', 'del', 'extraMethod')
    })

    it('can limit exposed default methods', () => {
      client = { request: sinon.spy() }

      resourceFactory = resourceGenerator(client)

      resource = resourceFactory({ baseRoute: '/mock-base', enabledMethods: ['list', 'get']})

      expect(resource)
        .to.include.all.keys('list', 'get')
    })
  })
})
