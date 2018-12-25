<div align="center">

# portal

> HTTP API clients ... simplified.

</div>

## Motivation

> Inspired when developing an internal API client in my company [Yamsafer](https://github.com/Yamsafer) :heart:, and by the design of the [Cloudflare NodeJS client](https://github.com/cloudflare/node-cloudflare) :heart:.

This library aims to simplify the creation of HTTP API clients by providing a declarative abstraction of HTTP requests.

Instead of worrying about how to consume some HTTP API, we should focus on the buisness logic behind this API call, so instead of worrying about whether the HTTP request library uses promises, or callbacks, or how the response object is formated, you simply declare what you want, and move on with your life.

So instead of having the focus be centered around how you make the request like the following,

```javascript
import request from 'request' // or who knows what you wanna use ¯\_(ツ)_/¯

function myApiWrapper (arg1, arg2) {
  return new Promise((resolve, reject) => {
    request(
      `https://some.api/some/url/${arg1}/some-resource/${arg2}`,
      /*other options who knows,*/
      (error, response, data) => {
        if (error) reject(error)

        resolve(response) // or data ¯\_(ツ)_/¯
      }
    )
  })
}

/// TOO MUCH BOILERPLATE !!
```

The above boilerplate where you worry about whether you're using `request` or `request-promise` or whatnot, and you worry about ho to resolve your response and what it looks like, get completely abstracted and unified into,

```javascript
import portal from '@ojizero/portal'

const portalBase = portal({ baseUrl: 'https://some.api' })

const myApiWrapper = portalBase.route({ path: '/some/url/:arg1/some-resource/:arg2' })

/// Woosh done :D
```

And you gain the consistent response structure (placed inside a promise). This can be extended even further into building entire clients for you APIs!

It also adds support for standardized validation for request arguments, query strings, and payload (provided using [Joi](https://github.com/hapijs/joi) :heart:)

## Installation

With NPM

```
npm i -S @ojizero/portal
```

Or if you're into Yarn

```
yarn add @ojizero/portal
```

## Usage

Aimed to be used as a building block for API client libraries

```typescript
/// In your library or definition file
import portal from '@ojizero/portal'

const client = portal({ baseUrl: 'some.base.url' }) // Initial configuration can be passed here

// Get method without path variables
export const someGetMethod = client.route({ path: '/some/path' })
// Get method with path variables
export const someGetMethodWithParam = client.route({ path: '/some/path/:withInnerVariable' })

/// NOTE: ideally this wouldn't be a module level instance but this is to simplify this example 😬

/* ******************* */

/// In your application
import YourAPIClient from 'your-client-module'

const someGetMethodPromise = YourAPIClient.someGetMethod() // GET http://some.base.url/some/path
const someGetMethodWithParamPromise = YourAPIClient.someGetMethodWithParam(5) // GET http://some.base.url/some/path/5
```

Examples can be found in the [`examples`](./examples) folder

## API Documentation

### (default export) createPortalClient(config)

Used to create a portal base client. Returns a [portal object](####portal-object)

#### config

> All config options are required unless otherwise stated.

##### baseUrl

Type: `string` (required).

The base URL used by the client, all related URIs are prepended by it.

##### headers

Type: `OutgoingHttpHeaders`

The default headers to be attached to all requests.

##### authentication

Type: `Authentication`

###### Authentication

**type**

Type: `AuthenticationTypes` (required)

Valid `AuthenticationTypes` are:

- `None` = 'none'
  - No authentication required. (same as not providing the `authentication` option)
- `BasicAuth` = 'basic',
  - Use `username` and `password` to generate a token.
  - Token is added to the `Authorization` header prepended with `basic`.
- `BearerAuth` = 'bearer',
  - Use `authToken` as is.
  - Token is added to the `Authorization` header prepended with `bearer`.

**username**

Type: `string`

Required if using `BasicAuth` type.

**password**

Type: `string`

Required if using `BasicAuth` type.

**authToken**

Type: `string`

Required if using `BearerAuth` type.

##### retries

Type: `number`

Number of retries to execute on failures, default is `0`.

##### timeout

Type: `number`

Request timeout in seconds, default is `30`

##### onError

Type: `'reject'` | `'resolve'`

> TODO: I think it's not working currently 🤔

If set to `resolve` error won't throw, instead will return a normal response, default is `reject`.

#### Portal Object

The returns object has three attributes

##### route

Which is a MethodFactory, it can be used to generate client routes.

##### resource

Which is a ResourceFactory, it can be used to generate client resources.

##### _client

Which is the underlying client instance used by the factories.

## Status

This is still a work in progress :D any help is appreciated

### TODO

- [ ] Finish documentations
  - [x] Why?
  - [ ] More on external API
- [ ] Support non JSON payload
- [ ] Get `onError: resolve` to work
- [ ] Support simplified form for validation
- [ ] Finalize behvaiour of genreator method functions
  - [ ] What to do with their arguments (ambiguity of options/payload/querystring in args)
  - [ ] Support optional path arguments ?
- [ ] ...

## License

[MIT licensed](LICENSE).
