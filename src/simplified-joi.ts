import Joi, { SchemaLike } from 'joi'

const JOI_MAPPING: { [k: string]: SchemaLike } = {
  string: Joi.string(),
  number: Joi.number(),
  symbol: Joi.symbol(),
  object: Joi.object(),
  array: Joi.array(),
}

function isObject (value: any): value is { [k: string]: any } {
  return !!value && typeof value === 'object'
}

function isArray (value: any): value is Array<any> {
  return !!value && Array.isArray(value)
}

function isJoiSchema (value: any): value is SchemaLike {
  return !!value && value.isJoi
}

export function transformSchema (schema: any): SchemaLike {
  if (isJoiSchema(schema)) return schema

  if (isArray(schema)) {
    schema = schema.map(transformSchema)

    return Joi.array().ordered(schema).required()
  }

  if (isObject(schema)) {
    schema = Object.entries(schema)
      .reduce((acc, [key, value]) => ({
          ...acc,
          [key]: transformSchema(value),
        }), {})

    return Joi.object(schema).required()
  }

  const [schemaName, schemaOptions = ''] = (schema as string).split('|', 2)

  const isRaw = /raw/i
  const isNotRequired = /notrequired/i

  if (isRaw.test(schemaOptions)) return schemaName

  schema = JOI_MAPPING[schemaName]

  if (typeof schema === 'undefined') {
    throw new Error(`Requested Joi validator ${schema} unsupported or undefined.`)
  }

  return isNotRequired.test(schemaOptions) ? schema : schema.required()
}

export default transformSchema
