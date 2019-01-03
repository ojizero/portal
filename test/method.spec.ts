/// <reference path='typings/globals.d.ts' />

import method, { MethodSpec } from '../src/method'

import { Client } from '../src/client'
import Joi from 'joi'

const mockGetMethodNoParams: MethodSpec = {
  path: '/mock-path',
  accept: 'mock/type',
  contentType: 'mock/type',
}

const mockGetMethodWithParams: MethodSpec = {
  path: '/mock-path/:param:',
  accept: 'mock/type',
  contentType: 'mock/type',
}

const mockPostMethodNoParams: MethodSpec = {
  path: '/mock-path',
  method: 'POST',
  body: Joi.object({
    some: Joi.object({ mock: Joi.string().required() }).required()
  }).required(),
  accept: 'mock/type',
  contentType: 'mock/type',
}

const mockPostMethodWithParams: MethodSpec = {
  path: '/mock-path/:param:',
  method: 'POST',
  // TODO: specify body spec
  accept: 'mock/type',
  contentType: 'mock/type',
}

const mockGetMethodWithQueryString: MethodSpec = {
  path: '/mock-path/:param:',
  accept: 'mock/type',
  contentType: 'mock/type',
  queryString: Joi.object({
    some_arg: Joi.string().required()
  }),
}

describe('Method', async () => {
  let client: Client
  let methodGenerator
  let methodFunction

  before(() => {
    client = { request: sinon.spy() }
  })

  it('accepts client and returns generator function', async () => {
    methodGenerator = method(client)

    expect(methodGenerator).to.be.a('function')
  })

  it('accepts a method specification and returns a method function', () =>{
    methodFunction = methodGenerator(mockGetMethodNoParams)

    expect(methodFunction).to.be.a('function')
  })

  describe('Generated method function', async () => {
    beforeEach(() => {
      client = { request: sinon.spy() }
      methodGenerator = method(client)
    })

    it('calls underlying request on client', async () => {
      methodFunction = methodGenerator(mockGetMethodNoParams)

      await methodFunction()

      expect(client.request)
        .to.have.been.calledOnceWithExactly(
          'GET',
          '/mock-path',
          undefined,
          {
            headers: {
              'Accept': mockGetMethodNoParams.accept,
              'Content-Type': mockGetMethodNoParams.contentType,
            }
          }
        )
    })

    it('requires path parameters if specified', async () => {
      methodFunction = methodGenerator(mockGetMethodWithParams)

      return expect(methodFunction()).to.eventually.be.rejected
    })

    it('passes path parameters if specified', async () => {
      methodFunction = methodGenerator(mockGetMethodWithParams)

      await methodFunction({ param: 10 })

      expect(client.request)
        .to.have.been.calledOnceWithExactly(
          'GET',
          '/mock-path/10',
          undefined,
          {
            headers: {
              'Accept': mockGetMethodNoParams.accept,
              'Content-Type': mockGetMethodNoParams.contentType,
            }
          }
        )
    })

    it('requires body arguments if specified', async () => {
      methodFunction = methodGenerator(mockPostMethodNoParams)

      return expect(methodFunction()).to.eventually.be.rejected
    })

    it('passes body arguments if specified', async () => {
      methodFunction = methodGenerator(mockPostMethodNoParams)
      const payload = { some: { mock: 'payload '} }

      await methodFunction({ $payload: payload })

      expect(client.request)
        .to.have.been.calledOnceWithExactly(
          'POST',
          '/mock-path',
          payload,
          {
            headers: {
              'Accept': mockGetMethodNoParams.accept,
              'Content-Type': mockGetMethodNoParams.contentType,
            }
          }
        )
    })

    it('passes positional parameter and body arguments if specified', async () => {
      methodFunction = methodGenerator(mockPostMethodWithParams)
      const payload = { some: { mock: 'payload '} }

      await methodFunction({
        param: 10,
        $payload: payload,
      })

      expect(client.request)
        .to.have.been.calledOnceWithExactly(
          'POST',
          '/mock-path/10',
          payload,
          {
            headers: {
              'Accept': mockGetMethodNoParams.accept,
              'Content-Type': mockGetMethodNoParams.contentType,
            }
          }
        )
    })

    it('requires query string arguments if specified', async () => {
      methodFunction = methodGenerator(mockGetMethodWithQueryString)

      return expect(methodFunction()).to.eventually.be.rejected
    })

    it('passes query string arguments if specified', async () => {
      methodFunction = methodGenerator(mockGetMethodWithQueryString)
      const queryString = { some_arg: 'a-string' }

      await methodFunction({
        param: 10,
        $querystring: queryString,
      })

      expect(client.request)
        .to.have.been.calledOnceWithExactly(
          'GET',
          '/mock-path/10?some_arg=a-string',
          undefined,
          {
            headers: {
              'Accept': mockGetMethodNoParams.accept,
              'Content-Type': mockGetMethodNoParams.contentType,
            }
          }
        )
    })
  })
})
