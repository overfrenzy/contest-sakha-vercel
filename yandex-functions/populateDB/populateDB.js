const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const { v4: uuidv4 } = require('uuid');
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function insertParticipant(
  name,
  countryName,
  schoolName,
  contestName,
  awardName,
  year,
  tasks
) {
  const participantId = uuidv4();
  const countryId = await insertCountry(countryName);
  const schoolnameId = await insertSchoolname(schoolName);
  const schoolId = await insertSchool(schoolnameId);
  const contestId = await insertContest(contestName, year, tasks);
  const awardId = await insertAward(awardName);

  const query = `
  INSERT INTO participant (participant_id, name, country_id, school_id, participation_id, award_id)
  VALUES ("${participantId}", "${name}", "${countryId}", "${schoolId}", "${contestId}", "${awardId}")
`;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
}

async function insertCountry(name) {
  const countryId = uuidv4();
  const query = `
    INSERT INTO country (country_id, name)
    VALUES ("${countryId}", "${name}")
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return countryId;
}

async function insertSchoolname(name) {
  const schoolnameId = uuidv4();
  const query = `
    INSERT INTO schoolname (schoolname_id, name)
    VALUES ("${schoolnameId}", "${name}")
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return schoolnameId;
}

async function insertSchool(schoolnameId) {
  const schoolId = uuidv4();
  const query = `
    INSERT INTO school (school_id, schoolname_id)
    VALUES ("${schoolId}", "${schoolnameId}")
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return schoolId;
}

async function insertContest(name, year, tasks) {
  const contestId = uuidv4();
  const query = `
    INSERT INTO contest (contest_id, name, year, tasks)
    VALUES ("${contestId}", "${name}", ${year}, '${tasks}')
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return contestId;
}

async function insertAward(name) {
  const awardId = uuidv4();
  const query = `
    INSERT INTO award (award_id, name)
    VALUES ("${awardId}", "${name}")
  `;
  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(query);
  });
  return awardId;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  await driver.ready;

  if (!event.body || event.body.trim() === "") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Empty request body" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON format" }),
    };
  }

  const { name, countryName, schoolName, contestName, awardName, year, tasks } = body;

  await insertParticipant(
    name,
    countryName,
    schoolName,
    contestName,
    awardName,
    parseInt(year, 10),
    JSON.stringify(tasks)
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Participant added successfully" }),
  };
};