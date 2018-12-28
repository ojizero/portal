/// <reference path='typings/globals.d.ts' />

import Client, { Config, RawResponse, Authentication, ClientFn, Response } from '../src/client'

const mockRawResponse: RawResponse = {
  body: 'any',
  headers: { some: 'header' },
  statusCode: 200,
  statusMessage: 'OK',
}

const mockTransformedResponse: Response = {
  status: {
    code: 200,
    word: 'OK',
  },
  body: 'any',
  headers: { some: 'header' },
  _rawResponse: mockRawResponse,
}

const mockConfig: Config = {
  baseUrl: 'https://dummy.domain',
}

const mockBearerAuthConfig: Authentication = {
  type: 'bearer',
  authToken: 'some-token-value'
}

const mockBasicAuthConfig: Authentication = {
  type: 'basic',
  username: 'some-username',
  password: 'some-password',
}

const mockAuthConfigNotSupported /*: Authentication*/ = {
  type: 'invalid type'
}

describe('Client', () => {
  let rawClient: ClientFn
  let client: Client

  describe('Construct request options', () => {
    before(() => {
      rawClient = sinon.spy()
      client = new Client(rawClient, mockConfig)
    })

    it('transforms request parameters with all defaults', () => {
      const requestOptions = client.constructRequestOptions('GET', '/some-path', {}, {})

      expect(requestOptions).to.deep.equal({
        baseUrl: "https://dummy.domain",
        body: "{}",
        headers: {},
        json: false,
        method: "GET",
        retries: 0,
        throwHttpErrors: true,
        timeout: 30000,
        url: "/some-path",
      })
    })

    it('adds additional headers from options', () => {
      const requestOptions = client.constructRequestOptions('GET', '/some-path', {}, {
        headers: {
          some: 'mock'
        }
      })

      expect(requestOptions).to.deep.equal({
        baseUrl: "https://dummy.domain",
        body: "{}",
        headers: { some: 'mock' },
        json: false,
        method: "GET",
        retries: 0,
        throwHttpErrors: true,
        timeout: 30000,
        url: "/some-path",
      })
    })

    describe('Authentication setup', () => {
      before(() => {
        rawClient = sinon.spy()
        client = new Client(rawClient, mockConfig)
      })

      it('adds basic authentication', () => {
        // TODO:
      })

      it('adds bearer authentication', () => {
        // TODO:
      })
    })
  })

  describe('Setup authentication', () => {
    before(() => {
      rawClient = sinon.spy()
      client = new Client(rawClient, mockConfig)
    })

    it('throws for non-supported types', () => {
      // TODO: unable to test it as Typescript won't allow me to even compile it
      // expect(() => client.setupAuthentication(mockAuthConfigNotSupported))
      //   .to.throw()
    })

    it('transforms authentication spec for basic auth', () => {
      expect(client.setupAuthentication(mockBasicAuthConfig))
        .to.deep.equal({
          key: 'Authorization',
          useHeader: true,
          usePayload: false,
          useQueryString: false,
          value: 'Basic c29tZS11c2VybmFtZTpzb21lLXBhc3N3b3Jk',
        })
    })

    it('transforms authentication spec for bearer auth', () => {
      expect(client.setupAuthentication(mockBearerAuthConfig))
        .to.deep.equal({
          key: 'Authorization',
          useHeader: true,
          usePayload: false,
          useQueryString: false,
          value: 'Bearer some-token-value',
        })
    })
  })

  it('transform raw response', () => {
    client = new Client(sinon.spy(), mockConfig)

    expect(client.transformResponse(mockRawResponse))
      .to.deep.equal(mockTransformedResponse)
  })
})
