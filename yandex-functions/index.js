const { router } = require('yandex-cloud-functions-router');
const { testYdbConnection } = require('./testYdbConnection');

exports.handler = router({
  http: [
    {
      httpMethod: ['GET'],
      handler: async (event, context) => {
        // Handle HTTP request
        const isConnected = await testYdbConnection();
        const statusCode = isConnected ? 200 : 500;
        const body = isConnected ? 'Connected to YDB' : 'Not connected to YDB';
        return {
          statusCode,
          body,
        };
      },
    },
  ],
});
