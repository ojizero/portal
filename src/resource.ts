import { Client } from './client'
import method, { MethodSpec, MethodFactory } from './method'

const defaultBaseSpecs: { [k: string]: MethodSpec } = {
  list: {
    path: '/',
    method: 'GET',
  },
  get: {
    path: '/:id',
    method: 'GET',
  },
  edit: {
    path: '/:id',
    method: 'PUT',
  },
  add: {
    path: '/',
    method: 'POST',
  },
  del: {
    path: '/:id',
    method: 'DELETE',
  },
}

export interface ResourceConfig {
  baseRoute: string,
  enabledRoutes?: string[],
  extraMethods?: { [k:string]: MethodSpec },
}

export type ResourceFactory = (config: ResourceConfig) => Resource

export class Resource {
  client: Client
  baseRoute: string
  enabledRoutes: string[]
  methodFactory: MethodFactory

  constructor (client: Client, config: ResourceConfig) {
    const {
      baseRoute,
      extraMethods = {},
      enabledRoutes = Object.keys(defaultBaseSpecs),
    } = config

    this.client = client
    this.baseRoute = baseRoute.trim()

    if (this.baseRoute.endsWith('/')) this.baseRoute = this.baseRoute.slice(0, -1)

    this.enabledRoutes = enabledRoutes

    this.methodFactory = this.generateMethodFactory()

    this.initialize()
    this.setExtraMethods(extraMethods)
  }

  initialize () {
    this.enabledRoutes.forEach(route => {
      route = route.toLowerCase()
      const routeMethod = this.methodFromRoute(route)

      Object.defineProperty(this, route, {
        value: routeMethod,
        writable: false,
        enumerable: true, // TODO: is it okay to have them enumerable ?
      })

      // Add is aliased as set
      if (route === 'add') {
        Object.defineProperty(this, 'set', {
          value: routeMethod,
          writable: false,
          enumerable: true, // TODO: is it okay to have them enumerable ?
        })
      }
      // Del is aliased as delete
      if (route === 'del') {
        Object.defineProperty(this, 'delete', {
          value: routeMethod,
          writable: false,
          enumerable: true, // TODO: is it okay to have them enumerable ?
        })
      }
    })
  }

  methodFromRoute (route: string) {
    let spec = defaultBaseSpecs[route]

    if (!spec) throw new Error(`An unsupported default route, ${route}, requested.`)

    const prefix = this.baseRoute
    const suffix = spec.path

    spec = {
      ...spec,
      path: `${prefix}${suffix}`
    }

    return this.methodFactory(spec)
  }

  generateMethodFactory () {
    return method(this.client)
  }

  setExtraMethods (extraMethods?: { [k:string]: any }) {
    if (!extraMethods) return

    Object.entries(extraMethods)
      .forEach(([method, spec]) => {
        // TODO: should it be prefixed by basePath ?
        const fn = this.methodFactory(spec)

        Object.defineProperty(this, method, {
          value: fn,
          writable: false,
          enumerable: true, // TODO: is it okay to have them enumerable ?
        })
      })
  }
}

export default function resrouceGenerator (client: Client): ResourceFactory {
  return function (config: ResourceConfig): Resource {
    return new Resource(client, config)
  }
}
