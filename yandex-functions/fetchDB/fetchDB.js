const { Driver, getCredentialsFromEnv, getLogger } = require('ydb-sdk');
const logger = getLogger({ level: 'debug' });
const endpoint = 'grpcs://ydb.serverless.yandexcloud.net:2135';
const database = '/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714';
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function fetchData() {
  let countries, schools, participations, awards, contests, schoolnames;

  await driver.tableClient.withSession(async (session) => {
    // Fetch countries data
    const countriesResult = await session.executeQuery(`
      SELECT * FROM country;
    `);
    countries = countriesResult.resultSets[0].rows.map(row => {
      const country_id = row.items[0]?.bytesValue?.toString('utf8') || '';
      const name = row.items[1].textValue;
      return { country_id, name };
    });

    // Fetch schools data
    const schoolsResult = await session.executeQuery(`
      SELECT * FROM school;
    `);
    schools = schoolsResult.resultSets[0].rows.map(row => {
      const school_id = row.items[0]?.bytesValue?.toString('utf8') || '';
      const schoolname_id = row.items[1]?.bytesValue?.toString('utf8') || '';
      return { school_id, schoolname_id };
    });

    // Fetch participations data
    const participationsResult = await session.executeQuery(`
      SELECT * FROM participation;
    `);
    participations = participationsResult.resultSets[0].rows.map(row => {
      const award_id = row.items[0]?.bytesValue?.toString('utf8') || '';
      const contest_id = row.items[1]?.bytesValue?.toString('utf8') || '';
      const participation_id = row.items[2]?.bytesValue?.toString('utf8') || '';
      const tasksdone = row.items[3].textValue;
      const time = row.items[4].textValue;
      const trycount = row.items[5].textValue;
      return { award_id, contest_id, participation_id, tasksdone, time, trycount };
    });

    // Fetch awards data
    const awardsResult = await session.executeQuery(`
      SELECT * FROM award;
    `);
    awards = awardsResult.resultSets[0].rows.map(row => {
      const award_id = row.items[0]?.bytesValue?.toString('utf8') || '';
      const name = row.items[1].textValue;
      return { award_id, name };
    });

    // Fetch contests data
    const contestsResult = await session.executeQuery(`
      SELECT * FROM contest;
    `);
    contests = contestsResult.resultSets[0].rows.map(row => {
      const contest_id = row.items[0]?.bytesValue?.toString('utf8') || '';
      const name = row.items[1].textValue;
      const tasks = row.items[2].textValue;
      const year = row.items[3].textValue;
      return { contest_id, name, tasks, year };
    });

    // Fetch school names data
    const schoolNamesResult = await session.executeQuery(`
      SELECT * FROM schoolname;
    `);
    schoolnames = schoolNamesResult.resultSets[0].rows.map(row => {
      const name = row.items[0].textValue;
      const schoolname_id = row.items[1]?.bytesValue?.toString('utf8') || '';
      return { name, schoolname_id };
    });
  });

  return {
    countries,
    schools,
    participations,
    awards,
    contests,
    schoolnames,
  };
}

exports.handler = async (event, context) => {
  const data = await fetchData();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};