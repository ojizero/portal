import { Client, Response, RequestConfig } from './client'

import defaults from 'lodash.defaultsdeep'
import {
  parse as parseQuery,
  stringify as stringifyQuery,
} from 'querystring'

import { ValdiationSpec, ensureValidData } from './validation';
import { OutgoingHttpHeaders } from 'http';

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

export type RouteFunction = (...args: any[]) => Promise<Response>
export type MethodFactory = (spec: MethodSpec) => RouteFunction

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

    const defaultOptions: RequestConfig = {
      headers: {
        'Accept': accept,
        'Content-Type': contentType,
        ...headers,
      }
    }

    return async function (...args: any[]): Promise<Response> {
      let length = args.length

      let query
      let payload
      let options

      if (typeof args[length - 1] === 'object') {
        // If the last argument it an
        // object use it as options
        options = args[length - 1]
        args = args.slice(0, length - 1)
        length -= 1
      }

      if (typeof args[length - 1] === 'object') {
        // If the second to last argument it an
        // object use it as a payload
        payload = args[length - 1]
        args = args.slice(0, length - 1)
        length -= 1
      } else if ((!!body) && typeof options !== 'undefined') {
        // If paylaod is expected and options is defined use
        // the last argument as payload instead of options
        payload = options
        options = undefined
      }

      if (typeof args[length - 1] === 'object') {
        // If the third to last argument it an
        // object use it as a query string
        query = args[length - 1]
        args = args.slice(0, length - 1)
        length -= 1
      } else if ((!!queryString) && (!!body)) {
        // Both query string and body are expected
        if (method === 'GET') {
          // For GET requests give precedence to query string
          query = payload
          payload = undefined
        } else {
          // For everything else give precedence to payload
          query = undefined
        }
      } else if ((!!queryString) && (!body)) {
        // Query string is expected but body isn't
        query = payload
        payload = undefined
      }

      ensureValidData(params, args, 'Parameters')
      ensureValidData(body, payload, 'Payload')
      ensureValidData(queryString, query, 'Query string')

      // Regexp here is global we wanna
      // match all avaialbel parameters
      let paramsCount: number = (path.match(/:[^\/:]+/g) || []).length

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

        query = stringifyQuery(query)
        fullPath = `${fullPath}?${query}`
      }

      options = defaults({}, defaultOptions, options)

      return client.request(method, fullPath, payload, options)
    }
  }
}

export default methodGenerator
