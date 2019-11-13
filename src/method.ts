import {
  Client,
  Response,
  RequestConfig as ClientRequestConfig
} from './client'

import defaults from 'lodash.defaultsdeep'
import {
  parse as parseQuery,
  stringify as stringifyQuery,
} from 'querystring'

import { OutgoingHttpHeaders } from 'http'
import {
  ValdiationSpec,
  ensureValidData as ensureValidInput,
} from './validation'

const applicationJson = 'application/json'

export interface MethodSpec {
  path: string,
  method?: string,
  params?: ValdiationSpec,
  // validator?: ValdiationSpec,
  body?: ValdiationSpec,
  queryString?: ValdiationSpec,
  contentType?: string,
  accept?: string,
  headers?: OutgoingHttpHeaders,
}

export type Input = { [k: string]: any }
export type RequestConfig = ClientRequestConfig & {
  path?: any[] | { [p: string]: any },
  payload?: any,
  queryString?: { [q: string]: any },
}

export type RouteFunction = (payload: Input, conf: RequestConfig) => Promise<Response>
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

    return async function (input: Input, conf: RequestConfig = {}): Promise<Response> {
      let {
        queryString: query,
        payload: confPayload,
        ...options
      } = conf

      ensureValidInput(params, input, 'Input')

      // Regexp here is global we wanna
      // match all avaialbel parameters
      let paramsCount: number = (path.match(/:[^:]+:/g) || []).length

      let fullPath: string = Object.entries(input)
        .reduce((acc, [key, value]) => {
          paramsCount -= 1

          return acc.replace(`:${key}:`, value)
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

      return client.request(
        method,
        fullPath,
        defaults({}, confPayload, input),
        defaults({}, defaultOptions, options),
      )
    }
  }
}

export default methodGenerator
