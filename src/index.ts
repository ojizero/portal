import Client from './client'
// import method from './method'
import Resource from './resource'

export enum AuthenticationTypes {
  BasicAuth = 'basic',
  TokenAuth = 'token',
  KeyAuth = 'key',
  BearerAuth = 'bearer',
}

export type Seconds = number

export type BaseUrl = string | URL

export interface Headers {}

export interface Authentication {
  type: AuthenticationTypes,
}

export interface Config {
  baseUrl: BaseUrl,
  headers?: Headers,
  authentication?: Authentication,
  retries?: number,
  timeout?: Seconds,
}

export interface Portal {
  // route: method, // TODO: function taking some spec
  // resource: Resource, // TODO: function taking some spec
  _client: Client,
}

export interface Response {
  status: {
    code: number,
    word: string,
  },
  body: Object | undefined,
  headers: Headers,
  _rawResponse: string, // raw string response
}

export function createBaseClient (config: Config): Portal {
  const client = new Client()

  const portal: Portal = {
    _client: client,
  }

  return portal
}

export { Client } from './client'
export { MethodSpec } from './method'

export default createBaseClient
