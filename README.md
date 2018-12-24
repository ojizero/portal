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

## Documentation

### createPortalClient

(default exported method)

Used to create a portal base client.

#### Input
```
{
  baseUrl?: string, // TODO: this shouldn't be optional but i can construct RequestConfig unless i set it as optional
  // protocol?: 'http' | 'https',
  // port?: number,
  headers?: OutgoingHttpHeaders,
  authentication?: Authentication,
  retries?: number, // available from RequestOptions
  timeout?: Seconds, // available from HttpsRequestOptions
  onError?: 'reject' | 'resolve',
}
```
#### Output
```
{
  route: MethodFactory,
  resource: ResourceFactory,
  _client: Client,
}
```
## Status

This is still a work in progress :D any help is appreciated

## License

[MIT licensed](LICENSE).
