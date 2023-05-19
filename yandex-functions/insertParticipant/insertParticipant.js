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

  participant.participant_id = uuidv4();
  participant.school_id = uuidv4();
  participant.country_id = uuidv4();
  participant.participation_id = uuidv4();
  participant.award_id = uuidv4();

  await driver.tableClient.withSession(async (session) => {
    await session.executeQuery(`
      INSERT INTO participant (participant_id, school_id, country_id, participation_id, award_id, name)
      VALUES ('${participant.participant_id}', '${participant.school_id}', '${participant.country_id}', '${participant.participation_id}', '${participant.award_id}', '${participant.name}');
    `);
  });
}

exports.handler = async (event, context) => {
  try {
    const participant = JSON.parse(event.body);
    await insertParticipant(participant);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Participant inserted successfully' }),
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: err.toString() };
  }
};
