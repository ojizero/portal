/// <reference path='typings/globals.d.ts' />

import Client, { Config, RawResponse, Authentication, AuthenticationTypes, ClientFn, Response } from '../src/client'

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
  type: AuthenticationTypes.BearerAuth,
  authToken: 'some-token-value'
}

const mockBasicAuthConfig: Authentication = {
  type: AuthenticationTypes.BasicAuth,
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
      //
    })

    it('adds additional headers from options', () => {
      //
    })

    describe('Authentication setup', () => {
      before(() => {
        rawClient = sinon.spy()
        client = new Client(rawClient, mockConfig)
      })

      it('adds basic authentication', () => {
        //
      })

      it('adds bearer authentication', () => {
        //
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
