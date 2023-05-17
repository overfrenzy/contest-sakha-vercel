const { Driver, getCredentialsFromEnv, getLogger } = require('ydb-sdk');
const logger = getLogger({ level: 'debug' });
const endpoint = 'grpcs://ydb.serverless.yandexcloud.net:2135';
const database = '/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714';
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function fetchData() {
    if (!await driver.ready(10000)) {
      logger.fatal(`Driver has not become ready in 10 seconds!`);
      process.exit(1);
    }
  
    let countries, schools, participations, awards, contests, schoolNames;
    
    await driver.tableClient.withSession(async (session) => {
      countries = await session.executeQuery(`
        SELECT * FROM country;
      `).then(result => result.rows);
  
      schools = await session.executeQuery(`
        SELECT * FROM school;
      `).then(result => result.rows);
  
      participations = await session.executeQuery(`
        SELECT * FROM participation;
      `).then(result => result.rows);
  
      awards = await session.executeQuery(`
        SELECT * FROM award;
      `).then(result => result.rows);
  
      contests = await session.executeQuery(`
        SELECT * FROM contest;
      `).then(result => result.rows);
  
      schoolNames = await session.executeQuery(`
        SELECT * FROM schoolname;
      `).then(result => result.rows);
    });
  
    return { countries, schools, participations, awards, contests, schoolNames };
  }
  

exports.handler = async (event, context) => {
  try {
    const data = await fetchData();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: err.toString() };
  }
};
