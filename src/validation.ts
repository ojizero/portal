import { SchemaLike, validate } from 'joi'

export interface Validator {
  validate (data: any[] | {}): boolean
}

function isCustomValidator (spec: any): spec is Validator {
  return !!spec && !spec.isJoi && 'validate' in spec
}

export function ensureValidData (spec: SchemaLike | Validator | undefined, data: any, name?: string) {
  if (!spec) return

  if (isCustomValidator(spec)) {
    const valid = spec.validate(data)

    if (valid) return
  }

  const { error } = validate(data, spec)

  if (!error) return

  throw new Error(`${!!name ? name+': ': ''}Provided data {${data}} failed to meat provided spec {${spec}}`)
}

export { SchemaLike }

export type ValdiationSpec = SchemaLike | Validator
