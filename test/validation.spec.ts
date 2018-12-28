/// <reference path='typings/globals.d.ts' />

import { ensureValidData } from '../src/validation'

import Joi, { valid } from 'joi'

const joiSchema = Joi.object({
  correctKey: Joi.strict().required()
}).required()

const customValidator = {
  validate (data) {
    return 'correctKey' in data
  }
}

const validData = {
  correctKey: 'correctValue'
}

const invalidData = {
  incorrectKey: 'some value',
}

describe('Ensure valid data', () => {
  describe('Using Joi schemas', () => {
    it('passes valid data', () => {
      expect(() => ensureValidData(joiSchema, validData))
        .to.not.throw()
    })

    it('rejects invalid data', () => {
      expect(() => ensureValidData(joiSchema, invalidData))
        .to.throw()
    })
  })

  describe('Using custom validators', () => {
    it('passes valid data', () => {
      expect(() => ensureValidData(customValidator, validData))
        .to.not.throw()
    })

    it('rejects invalid data', () => {
      expect(() => ensureValidData(customValidator, invalidData))
        .to.throw()
    })
  })

  describe.skip('Using simplified schemas', () => {
    it('passes valid data', () => {
      //
    })

    it('rejects invalid data', () => {
      //
    })
  })
})
