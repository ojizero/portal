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

export type RequestConfig = {
  /**
   * This following represents two separate values
   * the first is the object keys contianed
   * in the path arugments defined by
   * the method specificition.
   *
   * The second is a list of `$` prefixed options
   * that are the options that can configure
   * the underlying client. Those had to
   * be defined very loosely as there's
   * no way to augment keys in type
   * mapping. More details: https://github.com/Microsoft/TypeScript/issues/12754
   */
  // [clientConfigButPrefixedWith$: string]: any,
  [pathArgument: string]: any,
  // Helper parameters to pass body, querystrings, and headers easily
  $payload?: any,
  $querystring?: { [q: string]: any },
  $headers?: OutgoingHttpHeaders,
}

export type RouteFunction = (params: RequestConfig) => Promise<Response>
export type MethodFactory = (spec: MethodSpec) => RouteFunction

function extractConfigs (args: { [k: string]: any }): ClientRequestConfig {
  return Object.entries(args)
    .filter(([key]) => key.startsWith('$'))
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value
    }), {})
}

function extractPathArguments (args: { [k: string]: any }): { [k: string]: any } {
  return Object.entries(args)
    .filter(([key]) => !key.startsWith('$'))
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value
    }), {})
}

export function methodGenerator (client: Client): MethodFactory {
  return function methodFactory (spec: MethodSpec): RouteFunction {
    const {
      path,
      method: _method = 'GET',
      params: paramsSpec = undefined,
      body: bodySpec = undefined,
      queryString: querySpec = undefined,
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

    return async function (params: RequestConfig = {}): Promise<Response> {
      const {
        $payload: payload,
        $querystring: querystring,
        $headers: headers = {},
        ...args
      } = params

      let query = querystring

      let options = {
        headers,
        ...extractConfigs(args),
      }

      const pathArguments = extractPathArguments(args)

      ensureValidData(paramsSpec, pathArguments, 'Parameters')
      ensureValidData(bodySpec, payload, 'Payload')
      ensureValidData(querySpec, query, 'Query string')

      let fullPath = Object.entries(pathArguments)
        .reduce((acc, [key, value]) => acc.replace(`:${key}:`, value), path)

      if (fullPath.includes(':')) throw new Error('Provided arguments do not match full arguments required by path')

      if (query) {
        let attachedQuery
        [ fullPath, attachedQuery ] = fullPath.split('?', 2)

        query = {
          ...parseQuery(attachedQuery),
          ...query,
        }

        fullPath = `${fullPath}?${stringifyQuery(query)}`
      }

      options = defaults({}, options, defaultOptions)

      return client.request(method, fullPath, payload, options)
    }
  }
}

export default methodGenerator
