const {
  Joi,
  createPortalClient,
} = require('@ojizero/portal')

function makeESClient (host) {
  const client = createPortalClient({
    baseUrl: host,
    onHttpErrors: 'resolve',
  })

  return {
    createIndex: client.route({
      path: '/:indexName',
      method: 'PUT',
    }),
    deleteIndex: client.route({
      path: '/:indexName',
      method: 'DELETE',
    }),
    getDocument: client.route({
      path: '/:indexName/:docType/:docId',
      method: 'GET',
    }),
    addDocument: client.route({
      path: '/:indexName/:docType/:docId',
      method: 'POST',
    }),
    bulkOperation: client.route({
      path: '/_bulk',
      method: 'POST',
      contentType: 'application/x-ndjson',
    }),
  }
}

module.exports = makeESClient

if (require.main === module) {
(async function () {
  const client = makeESClient('http://localhost:9200')
  let response

  response = await client.createIndex('test-index')
  console.log({ createIndex: { stringifiedResponse: JSON.stringify(response) } })

  response = await client.addDocument('test-index', 'test-type', 'test-id', { payload: { a: { test: 'document' } } })
  console.log({ addDocument: { stringifiedResponse: JSON.stringify(response) } })

  response = await client.getDocument('test-index', 'test-type', 'test-id')
  console.log({ getDocument: { stringifiedResponse: JSON.stringify(response) } })

  response = await client.bulkOperation({
    payload: `{"index":{"_index":"test-index","_type":"test-type","_id":"bulk-document-id"}}
{"a":{"test":"bulkoperation"}}
`
  })
  console.log({ bulkOperation: { stringifiedResponse: JSON.stringify(response) } })
})()
}
