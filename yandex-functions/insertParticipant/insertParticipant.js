const { Driver, getCredentialsFromEnv, getLogger } = require('ydb-sdk');
const { v4: uuidv4 } = require('uuid');
const logger = getLogger({ level: 'debug' });
const endpoint = 'grpcs://ydb.serverless.yandexcloud.net:2135';
const database = '/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714';
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function insertParticipant(participant) {
  if (!await driver.ready(10000)) {
    logger.fatal(`Driver has not become ready in 10 seconds!`);
    process.exit(1);
  }

  const participantId = uuidv4();
  const participationId = uuidv4();

  await driver.tableClient.withSession(async (session) => {
    // Insert participant
    await session.executeQuery(`
      INSERT INTO participant (participant_id, school_id, country_id, participation_id, name)
      VALUES ('${participantId}', '${participant.school}', '${participant.country}', '${participationId}', '${participant.name}');
    `);

    // Insert participation
    await session.executeQuery(`
      INSERT INTO participation (participation_id, participant_id, award_id, contest_id, tasksdone, time, trycount)
      VALUES ('${participationId}', '${participantId}', '${participant.award}', '${participant.contest}', '${participant.tasksDone}', ${participant.time || 'NULL'}, ${participant.tryCount || 'NULL'});
    `);
  });
}

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: headers,
      body: "",
    };
  }

  if (!event.body || event.body.trim() === "") {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ message: "Empty request body" }),
    };
  }

  try {
    const participant = JSON.parse(event.body);
    await insertParticipant(participant);
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ message: "Participant inserted successfully" }),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: headers,
      body: err.toString(),
    };
  }
};
