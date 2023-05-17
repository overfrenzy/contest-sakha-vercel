const { Driver, getCredentialsFromEnv, getLogger } = require('ydb-sdk');
const logger = getLogger({ level: 'debug' });
const endpoint = 'grpcs://ydb.serverless.yandexcloud.net:2135';
const database = '/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714';
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function insertParticipant(name, countryName, schoolName, contestName, awardName) {
  const countryId = await insertCountry(countryName);
  const schoolnameId = await insertSchoolname(schoolName);
  const schoolId = await insertSchool(schoolnameId);
  const contestId = await insertContest(contestName);
  const awardId = await insertAward(awardName);

  const query = `
    INSERT INTO participant (name, country, school, participation, award)
    VALUES ("${name}", ${countryId}, ${schoolId}, ${contestId}, ${awardId})
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
}

async function insertCountry(name) {
  const query = `
    INSERT INTO country (name)
    VALUES ("${name}")
  `;
  let countryId;
  await driver.tableClient.withSession(async (session) => {
    const result = await session.executeQuery(query);
    countryId = result.getLastInsertId();
  });
  return countryId;
}

async function insertSchoolname(name) {
  const query = `
    INSERT INTO schoolname (name)
    VALUES ("${name}")
  `;
  let schoolnameId;
  await driver.tableClient.withSession(async (session) => {
    const result = await session.executeQuery(query);
    schoolnameId = result.getLastInsertId();
  });
  return schoolnameId;
}

async function insertSchool(schoolnameId) {
  const schoolQuery = `
    INSERT INTO school (schoolname)
    VALUES (${schoolnameId})
  `;
  let schoolId;
  await driver.tableClient.withSession(async (session) => {
    const result = await session.executeQuery(schoolQuery);
    schoolId = result.getLastInsertId();
  });
  return schoolId;
}

async function insertContest(name, year, tasks) {
  const query = `
    INSERT INTO contest (name, year, tasks)
    VALUES ("${name}", ${year}, '${tasks}')
  `;
  let contestId;
  await driver.tableClient.withSession(async (session) => {
    const result = await session.executeQuery(query);
    contestId = result.getLastInsertId();
  });
  return contestId;
}

async function insertAward(name) {
  const query = `
    INSERT INTO award (name)
    VALUES ("${name}")
  `;
  let awardId;
  await driver.tableClient.withSession(async (session) => {
    const result = await session.executeQuery(query);
    awardId = result.getLastInsertId();
  });
  return awardId;
}


exports.handler = async (event, context) => {
  await driver.ready;

  if (!event.body || event.body.trim() === '') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Empty request body' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid JSON format' }),
    };
  }

  const { name, countryName, schoolName, contestName, awardName } = body;

  await insertParticipant(name, countryName, schoolName, contestName, awardName);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Participant added successfully' }),
  };
};
