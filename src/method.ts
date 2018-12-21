import { Client } from './client'

const applicationJson = 'application/json'

export interface MethodSpec {
  path: string,
  method?: string,
  body?: {},
  queryString?: {},
  contentType?: string,
  accept?: string,
  strict?: boolean,
}

export function method (client: Client) {
  return function methodGenerator (spec: MethodSpec) {
    const {
      path,
      method = 'GET',
      body = {},
      queryString = {},
      contentType = applicationJson,
      accept = applicationJson,
      strict = true
    } = spec

    // It's ok for args here to be of implicit type any[]
    // @ts-ignore
    return function (...args) {
      // TODO: replace path params with args
      // TODO: reject if args doesn't match path params if strict

      // TODO: last argument is allowed to be object, JSON payload
      // TODO: reject if body doesn't match body spec if strict

      return client.request(method, path, {})
    }
  }
}

export default method
