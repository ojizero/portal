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
  // strict?: boolean,
  headers?: OutgoingHttpHeaders,
}

export type RouteFunction = (...args: any[]) => Promise<Response>
export type MethodFactory = (spec: MethodSpec) => RouteFunction

export function method (client: Client): MethodFactory {
  return function methodGenerator (spec: MethodSpec): RouteFunction {
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
        options = args[length - 1]
        args = args.slice(0, length - 1)
        length -= 1
      }

      if (typeof args[length - 1] === 'object') {
        payload = args[length - 1]
        args = args.slice(0, length - 1)
        length -= 1
      } else if (
        // TODO: ??? does this make sense ?
        (typeof body !== 'undefined' || method === 'POST' || method === 'PUT')
        && typeof options !== 'undefined'
      ) {
        const optionsHasPayload = 'payload' in options

        payload = optionsHasPayload ? options.payload : options
        options = optionsHasPayload ? options : undefined
      }

      if (typeof args[length - 1] === 'object') {
        query = args[length - 1]
        args = args.slice(0, length - 1)
        length -= 1
      } else if (typeof queryString !== 'undefined' && typeof options !== 'undefined') {
        const optionsHasQueryString = 'queryString' in options

        query = optionsHasQueryString ? options.queryString : options
        options = optionsHasQueryString ? options : undefined
      } else if (typeof queryString !== 'undefined' && typeof payload !== 'undefined') {
        query = payload
        payload = undefined
      }

      ensureValidData(params, args, 'Parameters')
      ensureValidData(body, payload, 'Payload')
      ensureValidData(queryString, query, 'Query string')

      // Regexp here isn global we wanna
      // match all avaialbel parameters
      let paramsCount = (path.match(/:[^\/:]+/g) || []).length

      let fullPath: string = args.reduce((acc, arg) => {
        paramsCount -= 1

        // Regexp here isn't global we wanna
        // match the first parameter only
        return acc.replace(/:[^\/:]+/, arg)
      }, path)

      if (paramsCount !== 0) throw new Error('Number of provided parameters does not macth request path arguments')

      if (query) {
        let attachedQuery
        [ fullPath, attachedQuery ] = fullPath.split('?', 2)

        query = {
          ...query,
          ...parseQuery(attachedQuery),
        }

        query = stringifyQuery(query)
        fullPath = `${fullPath}?${query}`
      }

      options = defaults({}, defaultOptions, options)

      return client.request(method, fullPath, payload, options)
    }
  }
}

export default method
