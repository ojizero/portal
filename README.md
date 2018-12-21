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
client.route('someGetMethod', { path: '/some/path' })

// Get method with path variables
client.route('someGetMethodWithParam', { path: '/some/path/:withInnerVariable' })

export default client

/* ******************* */

/// In your application
import YourClient from 'your-client-module'

const client = YourClient() // You can also pass additional options to futher configure the client

const someGetMethodPromise = client.someGetMethod() // GET http://some.base.url/some/path
const someGetMethodWithParamPromise = client.someGetMethodWithParam(5) // GET http://some.base.url/some/path/5
```
