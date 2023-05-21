const express = require('express');
const serverless = require('serverless-http');
const { Driver, getCredentialsFromEnv, getLogger } = require('ydb-sdk');

const app = express();
const logger = getLogger({ level: 'debug' });
const endpoint = 'grpcs://ydb.serverless.yandexcloud.net:2135';
const database = '/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714';
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

app.use(express.json());

async function fetchData() {
    if (!await driver.ready(10000)) {
        logger.fatal(`Driver has not become ready in 10 seconds!`);
        process.exit(1);
    }

    let countries = [];
    let schools = [];
    let participations = [];
    let awards = [];
    let contests = [];
    let schoolNames = [];

    await driver.tableClient.withSession(async (session) => {
        countries = await session.executeQuery(`
            SELECT * FROM country;
        `).then(result => result.rows);
        console.log('countries:', countries);

        schools = await session.executeQuery(`
            SELECT * FROM school;
        `).then(result => result.rows);
        console.log('schools:', schools);

        participations = await session.executeQuery(`
            SELECT * FROM participation;
        `).then(result => result.rows);
        console.log('participations:', participations);

        awards = await session.executeQuery(`
            SELECT * FROM award;
        `).then(result => result.rows);
        console.log('awards:', awards);

        contests = await session.executeQuery(`
            SELECT * FROM contest;
        `).then(result => result.rows);
        console.log('contests:', contests);

        schoolNames = await session.executeQuery(`
            SELECT * FROM schoolname;
        `).then(result => result.rows);
        console.log('schoolNames:', schoolNames);
    });

    return { countries, schools, participations, awards, contests, schoolNames };
}

app.get('/', async (req, res) => {
    try {
      const data = await fetchData();
      res.status(200).send(data);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: err.toString() });
    }
  });

exports.handler = serverless(app);
