import PortalClient, { Client, Config } from './client'

import method, { MethodFactory } from './method'
import resrouceGenerator, { ResourceFactory } from './resource'

import got from 'got'

export interface Portal {
  route: MethodFactory,
  resource: ResourceFactory,
  _client: Client,
}

export function createBaseClient (config: Config): Portal {
  const client = new PortalClient(got, config)

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
