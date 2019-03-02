<div align="center">

# portal

> HTTP API clients ... simplified.

</div>

## Motivation

> Inspired when developing an internal API client in my company [Yamsafer](https://github.com/Yamsafer) :heart:, and by the design of the [Cloudflare NodeJS client](https://github.com/cloudflare/node-cloudflare) :heart:.

This library aims to simplify the creation of HTTP API clients by providing a declarative abstraction of HTTP requests.

Instead of worrying about how to consume some HTTP API, we should focus on the buisness logic behind this API call, so instead of worrying about whether the HTTP request library uses promises, or callbacks, or how the response object is formated, you simply declare what you want, and move on with your life.

So instead of having the focus be centered around how you make the request like the following,

```js
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

```js
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

<!-- We separate installation of `got` and `portal` to prepare for later support of multiple internal clients, mainly to support browsers using `ky` without introducing breaking changes. -->

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
// Post method with path variables
export const somePostMethodWithParam = client.route({ path: '/some/path/:withInnerVariable', method: 'POST' })

/// NOTE: ideally this wouldn't be a module level instance but this is to simplify this example 😬

/* ******************* */

/// In your application
import * as YourAPIClient from 'your-client-module'

const someGetMethodPromise = YourAPIClient.someGetMethod() // GET http://some.base.url/some/path
const someGetMethodWithParamPromise = YourAPIClient.someGetMethodWithParam(5) // GET http://some.base.url/some/path/5
const somePostMethodWithParamPromise = YourAPIClient.someGetMethodWithParam(5, { payload: { some: 'payload' } }) // POST http://some.base.url/some/path/5 { some: 'payload' }
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

###### Usage example

```js
/* --- snip --- */

const getRoute = portalObject.route({ path: '/some/base/path' })
await getRoute() // GET /some/base/path
await getRoute({ queryString: { a: 10 } }) // GET /some/base/path?a=10

/* --- snip --- */

const postRoute = portalObject.route({ path: '/some/base/path', method: 'POST' })
await postRoute({ payload: { some: 'payload' } }) // POST /some/base/path { some: 'payload' }

/* --- snip --- */
```

###### RouteFunction

Type: `(...args: any[]): Promise<Response>`

A function that takes any number of arguments and performs the HTTP request.

The only special argument is the last one, which can be an object hodling any request options that can be used by the underlying client, as well as the payload (under the key `payload`) and query string (under the key `queryString`) objects if needed.

Example calls would be

```js
getMethod(arg1, arg2, /*...,*/ argn)
getMethod(arg1, arg2, /*...,*/ argn, { queryString: { q: 'hello' } })
postMethod(arg1, arg2, /*...,*/ argn, { payload: { q: 'hello' } })
```

All calls to a RouteFunction produce a promise that resolves to an oject of [`Response`](######response) type.

###### Response

An object with the following attributes,

- `status`, which is an object holding the HTTP status both as a message and a code.
- `body`, any response body returns from the HTTP request
- `headers`, HTTP headers returned for the response
- `_rawResponse`, the raw underlying HTTP response object (from the underlying client library)

```ts
export interface Response {
  status: {
    code?: number,
    word?: string,
  },
  body: any,
  headers: IncomingHttpHeaders,
  [Symbol.for('portal:symbols:raw-response')]: RawResponse,
}
```

##### resource

A function (representing a ResourceFactory), and can be used to generate client resources. A resource is a basic CRUD API for a given route, providing a default set of APIs for `list`, `get`, `edit`, `add`, and `delete`, those APIs correspond to the following HTTP calls,

- list -> `GET /some-uri`
- get -> `GET /some-uri/:id`
- edit -> `PUT /some-uri/:id { some payload to update the ID with }`
- add (aliased as set) `POST /some-uri { some payload to create a new reource with }`
- del (aliased as delete) `DELETE /some-uri/:id`

It takes a [`ResourceConfig`](######resourceconfig) object as input and returns a ResourceFactory function. When calling the ResourceFactory, the result is an object with the list of CRUD operations (and any additional ones defined in the resource config) as function defined on it.

The result from using the resource factory, is an object with the enabled default resource method, and any other extra ones as its keys, and each of those keys poiting to the `RouteFunction` used to execute the API call.

###### ResourceConfig

An object with the following attributes,

**`baseRoute`** (required) `string`

The base API route to generate the CRUD around.

**`enabledRoutes`** (optional) `Array<string>`

The list of routes to enable, by default all basic CRUD APIs are enabled.

**`extraMethods`** (optional) `{ [k:string]: MethodSpec }`

A JSON with string keys mapping to corresponding [MethodSpec](######methodspec). Each key will be added an added method defined by it's corresponding spec. Defaults to `{}`.

###### Usage example

```js
/* --- snip --- */

const apiResource = portalObject.resource({ baseRoute: '/some/base/path' })
/**
 * apiResource has the following methods on it
 *   list, get, edit, add, set, del, delete
 * corresponding the default set of APIs in an HTTP resource
 */

await apiResource.list() // GET /some/base/path
await apiResource.get(someId) // GET /some/base/path/:someId
// ... etc

/* --- snip --- */
```

Each method defined on the resource object follows the type [RouteFunction](######routefunction).

##### _client

The underlying client instance used by the two previous factories. This is exposed only for transparncy but is not intended to be used ideally by anyone external.

##### Usage of the portal object

RouteFunction

## Status

This is still a work in progress :D any help is appreciated

### TODO

- [x] Finish documentations
  - [x] Why?
  - [x] More on external API
- [x] Support non JSON payload
- [x] Get `onError: resolve` to work
- [x] Support simplified form for validation
- [x] Finalize behvaiour of genreator method functions
  - [x] What to do with their arguments (ambiguity of options/payload/querystring in args)
  - [x] Document RouteFunction behvaiour
- [ ] Browser support through Ky ?

## License

[MIT licensed](LICENSE).
