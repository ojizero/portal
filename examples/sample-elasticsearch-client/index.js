const {
  Joi,
  createPortalClient,
} = require('@ojizero/portal')

function makeESClient (host) {
  const client = createPortalClient({
    baseUrl: host,
    onError: 'resolve',
  })

  return {
    createIndex: client.route({
      path: '/:indexName',
      method: 'PUT',
    }),
    getDocument: client.route({
      path: '/:indexName/:docType/:docId',
      method: 'GET',
    }),
    addDocument: client.route({
      path: '/:indexName/:docType/:docId',
      method: 'POST',
    })
    // TODO: elastic's bulk API currently is incompatible with portal :D
    // bulkOperation: client.route({
    //   path: '/_bulk',
    //   method: 'POST',
    //   // You can pass any Joi based schema for validation
    //   // Or you can use the simplified syntax provided by portal
    //   // Or you can use any custom object withe a `validate` method
    //   body: Joi.string().required(),
    //   // Joi.object({
    //   //   body: Joi.array().items(
    //   //     Joi.object({
    //   //       index: Joi.object({
    //   //         _index: Joi.string().required(),
    //   //         _type: Joi.string().required(),
    //   //         _id: Joi.string(),
    //   //       }).required(),
    //   //     }),
    //   //     Joi.object(),
    //   //   ).required()
    //   // }).required(),
    //   // headers: {
    //   //   'Content-Type': 'application/text',
    //   // }
    // }),
  }
}

module.exports = makeESClient

if (require.main === module) {
(async function () {
  const client = makeESClient('http://localhost:9200')
  let response

  response = await client.createIndex('test-index')
  delete response._rawResponse // This is a HUGE object
  console.log({ createIndex: { stringifiedResponse: JSON.stringify(response) } })

  response = await client.addDocument('test-index', 'test-type', 'test-id', { payload: { a: { test: 'document' } } })
  delete response._rawResponse // This is a HUGE object
  console.log({ addDocument: { stringifiedResponse: JSON.stringify(response) } })

  response = await client.getDocument('test-index', 'test-type', 'test-id')
  delete response._rawResponse // This is a HUGE object
  console.log({ getDocument: { stringifiedResponse: JSON.stringify(response) } })
})()
}
