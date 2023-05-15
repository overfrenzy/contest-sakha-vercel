const { Driver, getCredentialsFromEnv, getLogger } = require('ydb-sdk');
const logger = getLogger({ level: 'debug' });
const endpoint = 'grpcs://ydb.serverless.yandexcloud.net:2135';
const database = '/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714';
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function testYdbConnection() {
  if (!await driver.ready(10000)) {
    logger.fatal('Driver has not become ready in 10 seconds!');
    return false;
  }

  try {
    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery('SELECT 1');
    });

    console.log('YDB connection successful');
    return true;
  } catch (error) {
    console.error('YDB connection error:', error);
    return false;
  }
}

exports.testYdbConnection = testYdbConnection;
