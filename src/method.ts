import { Client, Response, RequestConfig as ClientRequestConfig } from './client'

import defaults from 'lodash.defaultsdeep'
import {
  parse as parseQuery,
  stringify as stringifyQuery,
} from 'querystring'

import { OutgoingHttpHeaders } from 'http'
import { ValdiationSpec, ensureValidData } from './validation'

const applicationJson = 'application/json'

export interface MethodSpec {
  path: string,
  method?: string,
  params?: ValdiationSpec,
  body?: ValdiationSpec,
  queryString?: ValdiationSpec,
  contentType?: string,
  accept?: string,
  headers?: OutgoingHttpHeaders,
}

export type RequestConfig = ClientRequestConfig & {
  path?: any[] | { [p: string]: any },
  payload?: any,
  queryString?: { [q: string]: any },
}
export type RouteFunction = (...args: any[]) => Promise<Response>
export type MethodFactory = (spec: MethodSpec) => RouteFunction

function isRequestConfig (arg: any): arg is RequestConfig {
  return typeof arg === 'object'
}

export function methodGenerator (client: Client): MethodFactory {
  return function methodFactory (spec: MethodSpec): RouteFunction {
    const {
      path,
      method: _method = 'GET',
      params = undefined,
      body = undefined,
      queryString = undefined,
      contentType = applicationJson,
      accept = applicationJson,
      headers = {},
    } = spec

    const method = _method.toUpperCase()

    const defaultOptions: ClientRequestConfig = {
      headers: {
        'Accept': accept,
        'Content-Type': contentType,
        ...headers,
      }
    }

    return async function (...args: any[]): Promise<Response> {
      let length = args.length

      let config: RequestConfig = {}

      if (isRequestConfig(args[length - 1])) {
        config = args[length - 1]
        args = args.slice(0, length - 1)
        length -= 1
      }

      let {
        queryString: query,
        payload,
        ...options
      } = config

      ensureValidData(params, args, 'Parameters')
      ensureValidData(body, payload, 'Payload')
      ensureValidData(queryString, query, 'Query string')

      // Regexp here is global we wanna
      // match all avaialbel parameters
      let paramsCount: number = (path.match(/:[^\/:&?]+/g) || []).length

      let fullPath: string = args.reduce((acc, arg) => {
        paramsCount -= 1

        // Regexp here isn't global we wanna
        // match the first parameter only
        return acc.replace(/:[^\/:&?]+/, arg)
      }, path)

      if (paramsCount !== 0) throw new Error('Number of provided parameters does not macth request path arguments')

      if (query) {
        let attachedQuery
        [ fullPath, attachedQuery ] = fullPath.split('?', 2)

        query = {
          ...parseQuery(attachedQuery),
          ...query,
        }

        fullPath = `${fullPath}?${stringifyQuery(query)}`
      }

      options = defaults({}, defaultOptions, options)

      return client.request(method, fullPath, payload, options)
    }
  }
}

export default methodGenerator
