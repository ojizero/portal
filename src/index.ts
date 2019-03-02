import PortalClient, { Client, ClientFn, Config as ClientConfig } from './client'

import methodGenerator, { MethodFactory } from './method'
import resrouceGenerator, { ResourceFactory } from './resource'

// let got: ClientFn

// try {
//   got = require('got')
// } catch (_) {}
import got from 'got'


// function forNode (clientType: ClientType | undefined): clientType is NodeClient {
//   return typeof clientType === 'undefined' || (clientType.type === 'node' || clientType.type === 'got')
// }

// function getClient (config: PortalConfig): ClientFn {
//   if (forNode(config.client)) return got

//   throw new Error(`Unspported client config ${config.client}`)
// }

// export interface ClientType {
//   type: 'node' | 'got', // | 'browser' | 'ky' | 'custom',
// }

// export interface NodeClient extends ClientType {
//   type: 'node' | 'got',
// }

export interface PortalConfig {
  // client?: NodeClient,
}

export type Config = ClientConfig & PortalConfig

export const clientSymbol = Symbol.for('portal:symbols:client')

export interface Portal {
  route: MethodFactory,
  resource: ResourceFactory,
  [clientSymbol]: Client,
}

export function createPortalClient (config: Config): Portal {
  const clientFn = got // getClient(config)
  const client = new PortalClient(clientFn, config)

  const portal: Portal = {
    route: methodGenerator(client),
    resource: resrouceGenerator(client),
    [clientSymbol]: client,
  }

  return portal
}

export { MethodSpec } from './method'
export { Client, rawResponseSymbol } from './client'

// Can't a the moment run export { * as Joi } from 'joi'
// so this clumsy way is the solution re-export
import * as Joi from 'joi'
export { Joi }

export default createPortalClient
