import got from 'got'
import querystring from 'querystring'
import { IncomingHttpHeaders } from 'http';
import { OutgoingHttpHeaders } from 'http'
import defaultsDeep from 'lodash.defaultsdeep'
import { RequestOptions as HttpsRequestOptions } from 'https';

export enum AuthenticationTypes {
  None = 'none',
  BasicAuth = 'basic',
  // TokenAuth = 'token',
  // ApiKeyAuth = 'key',
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

export interface RawResponse {
  body: any,
  statusCode?: number,
  statusMessage?: string,
  headers: IncomingHttpHeaders,
}

export interface Response {
  status: {
    code?: number,
    word?: string,
  },
  body: any,
  headers: IncomingHttpHeaders,
  _rawResponse: RawResponse,
}

// Add compatibility with Got type
export interface RequestOptions extends HttpsRequestOptions {
  baseUrl: string,
  url: string,
  json: boolean,
  body: string,
  retries?: number,
  throwHttpErrors: boolean,
}

export interface Config {
  baseUrl: string,
  // protocol?: 'http' | 'https',
  // port?: number,
  headers?: OutgoingHttpHeaders,
  authentication?: Authentication,
  retries?: number, // available from RequestOptions
  timeout?: Seconds, // available from HttpsRequestOptions
  onError?: 'reject' | 'resolve',
}

export type ClientFn = (options: RequestOptions) => Promise<RawResponse>

export interface RequestConfig extends RequestOptions, Config {}

export interface Client {
  request (method: string, path: string, payload: {}, options: any): Promise<Response>
}

export class PortalClient implements Client {
  client: ClientFn
  config: Config

  constructor (client: ClientFn, config: Config) {
    this.client = client
    this.config = config
  }

  async request (method: string, path: string, payload: {}, options: RequestConfig): Promise<Response> {
    const requestOptions = this.constructRequestOptions(method, path, payload, options)

    const response = await this.client(requestOptions)

    return this.transformResponse(response)
  }

  constructRequestOptions (method: string, path: string, payload: { [k: string]: any }, options: RequestConfig): RequestOptions {
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
      timeout: 30,
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
      case AuthenticationTypes.None: {
        return {
          useHeader: false,
          usePayload: false,
          useQueryString: false,
          key: '',
          value: '',
        }
      }
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

  transformResponse(response: RawResponse): Response {
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
}

export default PortalClient
