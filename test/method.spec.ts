/// <reference path='typings/globals.d.ts' />

import method from '../src/method'

import { Client } from '../src/client'
import { MockClient } from './mocks/client'

const mockMethodSpec = {}

describe('Method', () => {
  let mockClient: Client
  let methodGenerator
  let methodFunction

  before(() => {
    mockClient = new MockClient()
  })

  it('accepts client and returns generator function', () => {
    methodGenerator = method(mockClient)

    expect(true).to.deep.equal(true)
    // expect(methodFunction).to.be.a.function() // TODO:
  })

  it('accepts a method specification and returns a method function', () =>{
    methodFunction = methodGenerator(mockMethodSpec)

    // expect(methodFunction).to.be.a.function() // TODO:
  })

  describe('Method function', () => {
    it('calls underlying request on client', () => {
      methodFunction()

      // expect(someSpy).to.be.called.once.with.exaclty() // TODO:
    })

    it('requires path parameters if specified', () => {
      // methodFunction = undefined
      // methodFunction() // should throw
    })

    it('passes path parameters if specified', () => {
      // methodFunction = undefined
      // methodFunction(1) // should not throw
    })

    it('requires body arguments if specified', () => {
      // methodFunction = undefined
      // methodFunction() // should throw
    })

    it('passes body arguments if specified', () => {
      // methodFunction = undefined
      // methodFunction({ some: 'payload' })
    })
  })
})
