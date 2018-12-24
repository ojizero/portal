<div align="center">

# portal

> HTTP API clients ... simplified.

</div>

## Installation

```
npm install --save @ojizero/portal
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
  - [ ] Why?
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
