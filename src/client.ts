import got, { GotFn } from 'got'
import { RequestOptions } from 'https'
import { IncomingHttpHeaders } from 'http';

export interface Response {
  status: {
    code?: number,
    word?: string,
  },
  body: any,
  headers: IncomingHttpHeaders,
  _rawResponse: got.Response<any>, // raw string response
}

export interface Client {
  request (method: string, path: string, payload: {}, options: any): Promise<Response>
}

export class PortalClient implements Client {
  client: GotFn

  constructor (client: GotFn) {
    this.client = client
  }

  async request (method: string, path: string, payload: {}, options: any): Promise<Response> {
    const requestOptions = this.constructRequestOptions(method, path, payload, options)

    const response = await this.client(requestOptions)

    return {
      status: {
        code: response.statusCode,
        word: response.statusMessage,
      },
      body: response.body,
      headers: response.headers,
      _rawResponse: response,
    }
  }

  constructRequestOptions (method: string, path: string, payload: {}, options: any): RequestOptions {
    return {
      // TODO:
    }
  }
}

export default PortalClient
