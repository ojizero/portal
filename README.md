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

The above boilerplate where you worry about whether you're using `request` or `request-promise` or whatnot, and you worry about how to resolve your response and what it looks like, get completely abstracted and unified into,

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

The returns object has three attributes,

##### route

A function (representing a MethodFactory), used to generate client routes. It takes for an input a [MethodSpec](######methodspec) and returns a function representing the API call.

###### MethodSpec

An object with the following attributes

**`path`** (required) `string`

The URL path for the route, it should be a relateive path given the [baseUrl](#####baseurl) defined when initiating the portal client.

**`method`** (optional) `string`

The method for the HTTP call, defaults to `GET`.

**`params`** (optional) [`ValdiationSpec`]()

An optional validation specification for the path arguments in of the route.

**`body`** (optional) [`ValdiationSpec`]()

An optional validation specification for the payload arguments of the route.

**`queryString`** (optional) [`ValdiationSpec`]()

An optional validation specification for the query string arguments in of the route.

**`contentType`** (optional) `string`

The Content-Type header value of the request, defaults to `application/json`.

**`accept`** (optional) `string`

The Accept header value of the request, defaults to `application/json`.

**`headers`** (optional) `OutgoingHttpHeaders`

Additional headers to always be added to requests to the given route, defaults to `{}`.

##### resource

A function (representing a ResourceFactory), and can be used to generate client resources. A resource is a basic CRUD API for a given route, providing a default set of APIs for `list`, `get`, `edit`, `add`, and `delete`, those APIs correspond to the following HTTP calls,

- list -> `GET /some-uri`
- get -> `GET /some-uri/:id`
- edit -> `PUT /some-uri/:id { some payload to update the ID with }`
- add (aliased as set) `POST /some-uri { some payload to create a new reource with }`
- del (aliased as delete) `DELETE /some-uri/:id`

It takes a [`ResourceConfig`](######resourceconfig) object as input and returns a ResourceFactory function. When calling the ResourceFactory, the result is an object with the list of CRUD operations (and any additional ones defined in the resource config) as function defined on it.

###### ResourceConfig

An object with the following attributes,

**`baseRoute`** (required) `string`

The base API route to generate the CRUD around.

**`enabledRoutes`** (optional) `Array<string>`

The list of routes to enable, by default all basic CRUD APIs are enabled.

**`extraMethods`** (optional) `{ [k:string]: MethodSpec }`

A JSON with string keys mapping to corresponding [MethodSpec](######methodspec). Each key will be added an added method defined by it's corresponding spec. Defaults to `{}`.

##### _client

The underlying client instance used by the two previous factories. This is exposed only for transparncy but is not intended to be used ideally by anyone external.

## Status

This is still a work in progress :D any help is appreciated

### TODO

- [x] Finish documentations
  - [x] Why?
  - [x] More on external API
- [ ] Support non JSON payload
- [ ] Get `onError: resolve` to work
- [ ] Support simplified form for validation
- [ ] Finalize behvaiour of genreator method functions
  - [ ] What to do with their arguments (ambiguity of options/payload/querystring in args)
  - [ ] Support optional path arguments ?
- [ ] ...

## License

[MIT licensed](LICENSE).
