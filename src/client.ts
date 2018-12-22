import got, { GotFn } from 'got'
import querystring from 'querystring'
import { IncomingHttpHeaders } from 'http';
import { OutgoingHttpHeaders } from 'http'
import defaultsDeep from 'lodash.defaultsdeep'

export enum AuthenticationTypes {
  BasicAuth = 'basic',
  TokenAuth = 'token',
  ApiKeyAuth = 'key',
  BearerAuth = 'bearer',
}

export interface Authentication {
  type: AuthenticationTypes,
  username?: string,
  password?: string,
  authToken?: string,
}

interface AuthSpec {
  useHeader: boolean,
  usePayload: boolean,
  useQueryString: boolean,

  key: string,
  value: string,
}

export type Seconds = number

export interface Response {
  status: {
    code?: number,
    word?: string,
  },
  body: any,
  headers: IncomingHttpHeaders,
  _rawResponse: got.Response<any>, // raw string response
}

export interface Config {
  baseUrl: string,
  // protocol?: 'http' | 'https',
  // port?: number,
  headers?: OutgoingHttpHeaders,
  authentication?: Authentication,
  retries?: number,
  timeout?: Seconds,
  onError?: 'reject' | 'resolve',
}

export interface Client {
  request (method: string, path: string, payload: {}, options: any): Promise<Response>
}

export class PortalClient implements Client {
  client: GotFn
  config: Config

  constructor (client: GotFn, config: Config) {
    this.client = client
    this.config = config
  }

  async request (method: string, path: string, payload: {}, options: any): Promise<Response> {
    const requestOptions = this.constructRequestOptions(method, path, payload, options)

    const response = await this.client(requestOptions)

    return {
      status: {
        code: response.statusCode,
        word: response.statusMessage,
      },
      body: response.body, // TODO: should it be parsed if needed ?
      headers: response.headers,
      _rawResponse: response,
    }
  }

  constructRequestOptions (method: string, path: string, payload: { [k: string]: any }, options: any): { [s: string]: any } {
    const {
      baseUrl,
      headers,
      retries,
      timeout,
      onError,
      authentication,
    } = defaultsDeep({
      // port: 443,
      retries: 0,
      headers: {},
      timeout: 30_000,
      onError: 'reject',
      // protocol: 'https',
    }, this.config, options)

    if (typeof authentication !== 'undefined') {
      const {
        useHeader,
        usePayload,
        useQueryString,
        key,
        value,
      } = this.setupAuthentication(authentication)

      if (useHeader) {
        headers[key] = value
      } else if (usePayload) {
        payload[key] = value
      } else if (useQueryString) {
        const [url, queryString = ''] = path.split('?', 2)

        const query = querystring.parse(queryString)
        query[key] = value

        path = `${url}?${querystring.stringify(query)}`
      }
    }

    const isJson = headers['Content-Type'] === 'application/json'

    return {
      method,
      baseUrl,
      url: path,
      headers,
      retries,
      json: isJson,
      timeout: timeout * 1000,
      body: JSON.stringify(payload),
      throwHttpErrors: onError !== 'resolve',
    }
  }

  setupAuthentication (auth: Authentication): AuthSpec {
    switch (auth.type) {
      case AuthenticationTypes.BasicAuth: {
        const token = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')

        return {
          useHeader: true,
          usePayload: false,
          useQueryString: false,
          key: 'Authorization',
          value: `Basic ${token}`,
        }
      }

      case AuthenticationTypes.BearerAuth: {

        return {
          useHeader: true,
          usePayload: false,
          useQueryString: false,
          key: 'Authorization',
          value: `Bearer ${auth.authToken}`,
        }
      }
    }

    throw new Error('TODO: givem me a meangingful error')
  }
}

export default PortalClient
