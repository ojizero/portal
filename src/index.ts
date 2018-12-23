import PortalClient, { Client, Config } from './client'

import method, { MethodFactory } from './method'
import resrouceGenerator, { ResourceFactory } from './resource'

import got from 'got'

export interface Portal {
  route: MethodFactory,
  resource: ResourceFactory,
  _client: Client,
}

export function createPortalClient (config: Config): Portal {
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

// Can't a the moment run export { * as Joi } from 'joi'
// so this clumsy way is the solution re-export
import * as Joi from 'joi'
export { Joi }

export default createPortalClient
