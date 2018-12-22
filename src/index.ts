import Client from './client'

import method, { MethodFactory } from './method'
import resrouceGenerator, { ResourceFactory } from './resource'

import { URL } from 'url' // TODO: declare it instead of importing it
import got from 'got'
import { OutgoingHttpHeaders } from 'http'

export enum AuthenticationTypes {
  BasicAuth = 'basic',
  TokenAuth = 'token',
  KeyAuth = 'key',
  BearerAuth = 'bearer',
}

export type Seconds = number

export type BaseUrl = string | URL

export interface Authentication {
  type: AuthenticationTypes,
}

export interface Config {
  baseUrl: BaseUrl,
  headers?: OutgoingHttpHeaders,
  authentication?: Authentication,
  retries?: number,
  timeout?: Seconds,
  onError?: 'reject' | 'resolve',
}

export interface Portal {
  route: MethodFactory,
  resource: ResourceFactory,
  _client: Client,
}

export function createBaseClient (config: Config): Portal {
  const client = new Client(got) // TODO:

  const portal: Portal = {
    route: method(client),
    resource: resrouceGenerator(client),
    _client: client,
  }

  return portal
}

export { Client } from './client'
export { MethodSpec } from './method'

export default createBaseClient
