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

export type RequestBodyObject = { [k: string]: any }

export type RequestBody = string | RequestBodyObject // | Array<RequestBodyObject> // TODO: TS is made when i add the array :(

function isObject (body: RequestBody): body is RequestBodyObject {
  return typeof body === 'object'
}

// Add compatibility with Got type
export interface RequestOptions extends HttpsRequestOptions {
  baseUrl?: string,
  url?: string,
  json?: boolean,
  body?: RequestBody,
  retries?: number,
  throwHttpErrors?: boolean,
  headers?: OutgoingHttpHeaders,
}

export interface Config {
  baseUrl?: string, // TODO: this shouldn't be optional but i can construct RequestConfig unless i set it as optional
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
// export type RequestConfig = Config

export interface Client {
  request (method: string, path: string, payload: RequestBody, options: any): Promise<Response>
}

export class PortalClient implements Client {
  config: Config
  client: ClientFn

  constructor (client: ClientFn, config: Config) {
    // TODO: this shouldn't exists but i had to set baseUrl as otpional to construc the RequestConfig type
    if (typeof config.baseUrl === 'undefined') throw Error('TODO: givem em a meaningful message')

    this.client = client
    this.config = config
  }

  async request (method: string, path: string, payload: RequestBody, options: RequestConfig): Promise<Response> {
    const requestOptions = this.constructRequestOptions(method, path, payload, options)

    const response = await this.client(requestOptions)

    return this.transformResponse(response)
  }

  constructRequestOptions (method: string, path: string, payload: RequestBody, options: RequestConfig): RequestOptions {
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
      } else if (usePayload && isObject(payload)) {
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
      throwHttpErrors: onError !== 'resolve',
      body: isJson ? payload : JSON.stringify(payload),
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
