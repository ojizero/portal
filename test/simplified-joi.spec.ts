/// <reference path='typings/globals.d.ts' />

import Joi from 'joi'
import transformSchema from '../src/simplified-joi'

describe('Transform simplified validation schema to Joi schemas', () => {
  it('passes on `string` type', () => {
    const joiString = Joi.string().required()

    expect(transformSchema('string'))
      .to.deep.equal(joiString)
  })

  it('passes on `string|notrequired` type', () => {
    const joiString = Joi.string()

    expect(transformSchema('string|notrequired'))
      .to.deep.equal(joiString)
  })

  it('passes on `number` type', () => {
    const joiNumber = Joi.number().required()

    expect(transformSchema('number'))
      .to.deep.equal(joiNumber)
  })

  it('passes on `number|notrequired` type', () => {
    const joiNumber = Joi.number()

    expect(transformSchema('number|notrequired'))
      .to.deep.equal(joiNumber)
  })

  it('passes on `symbol` type', () => {
    const joiSymbol = Joi.symbol().required()

    expect(transformSchema('symbol'))
      .to.deep.equal(joiSymbol)
  })

  it('passes on `symbol|notrequired` type', () => {
    const joiSymbol = Joi.symbol()

    expect(transformSchema('symbol|notrequired'))
      .to.deep.equal(joiSymbol)
  })

  it('fails on undefined types', () => {
    expect(() => transformSchema('wubalubadubdub'))
      .to.throw()
  })

  it('transforms array schemas', () => {
    const joiArray = Joi.array().ordered(
      Joi.string().required(),
      Joi.number().required(),
      Joi.number(),
      Joi.string(),
    ).required()

    expect(transformSchema([
      'string',
      'number',
      'number|notrequired',
      'string|notrequired',
    ]))
      .to.deep.equal(joiArray)
  })

  it('transforms object schemas', () => {
    const joiObject = Joi.object({
      numberKey: Joi.number().required(),
      stringOptional: Joi.string(),
      someArray: Joi.array().ordered(Joi.string().required(), Joi.number()).required(),
    }).required()

    expect(transformSchema({
      numberKey: 'number',
      stringOptional: 'string|notrequired',
      someArray: ['string', 'number|notrequired'],
    }))
      .to.deep.equal(joiObject)
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
