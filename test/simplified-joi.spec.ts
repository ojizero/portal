/// <reference path='typings/globals.d.ts' />

import transformSchema from '../src/simplified-joi'
import Joi from 'joi';

describe('Transform simplified validation schema to Joi schemas', () => {
  it.skip('should pass on `string` type', () => {
    //
  })

  it.skip('should pass on `number` type', () => {
    //
  })

  it.skip('should pass on `symbol` type', () => {
    //
  })

  it('fails on undefined types', () => {
    expect(() => transformSchema('wubalubadubdub'))
      .to.throw()
  })

  it.skip('transforms array schemas', () => {
    //
  })

  it.skip('transforms object schemas', () => {
    //
  })

  it.skip('passes `notrequired` option to schemas', () => {
    //
  })

  it('passes `raw` option to schemas', () => {
    const value = 'something'
    const rawSchema = `${value}|raw`

    expect(transformSchema(rawSchema))
      .to.deep.equal(value)
  })

  it('returns Joi schema unmodified if passed', () => {
    const j = Joi.object().required()

    expect(transformSchema(j))
      .to.deep.equal(j)
  })
})
