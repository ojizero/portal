import { SchemaLike, validate } from '@hapi/joi'
import transformSchema from './simplified-joi'

// https://github.com/ianstormtaylor/superstruct

export interface Validator {
  validate (data: any[] | {}): boolean
}

function isCustomValidator (spec: any): spec is Validator {
  return !!spec && !spec.isJoi && 'validate' in spec
}

function isJoiSchema (spec: any): spec is SchemaLike {
  return !!spec && spec.isJoi
}

export type SimplifiedSpec = string | Array<string> | { [k: string]: SchemaLike | SimplifiedSpec }

export type ValdiationSpec = SchemaLike | Validator | SimplifiedSpec

export function ensureValidData (spec: ValdiationSpec | undefined, data: any, name?: string) {
  if (!spec) return

  if (isCustomValidator(spec)) {
    const valid = spec.validate(data)

    if (valid) return
  }

  if (!isJoiSchema(spec)) spec = transformSchema(spec)

  const { error } = validate(data, spec)

  if (!error) return

  throw new Error(`${!!name ? name+': ': ''}Provided data {${data}} failed to meat provided spec {${spec}}`)
}

export { SchemaLike }
