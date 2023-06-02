const { OAuth2Client } = require('google-auth-library');
const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");

const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function fetchData(email) {
  let countries, schools, participations, awards, contests, schoolnames, participants;

  await driver.tableClient.withSession(async (session) => {
    // Fetch countries data
    const countriesResult = await session.executeQuery(`
      SELECT * FROM country;
    `);
    countries = countriesResult.resultSets[0].rows.map((row) => {
      const country_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const name = row.items[1].textValue;
      return { country_id, name };
    });

    // Fetch schools data
    const schoolsResult = await session.executeQuery(`
      SELECT * FROM school;
    `);
    schools = schoolsResult.resultSets[0].rows.map((row) => {
      const school_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const schoolname_id = row.items[1]?.bytesValue?.toString("utf8") || "";
      return { school_id, schoolname_id };
    });

    // Fetch participations data
    const participationsResult = await session.executeQuery(`
      SELECT * FROM participation;
    `);
    participations = participationsResult.resultSets[0].rows.map((row) => {
      const award_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const contest_id = row.items[1]?.bytesValue?.toString("utf8") || "";
      const participant_id = row.items[2]?.bytesValue?.toString("utf8") || "";
      const participation_id = row.items[3]?.bytesValue?.toString("utf8") || "";
      const tasksdone = row.items[4].textValue;
      const time = row.items[5].textValue;
      const trycount = row.items[6].textValue;
      return {
        award_id,
        contest_id,
        participant_id,
        participation_id,
        tasksdone,
        time,
        trycount,
      };
    });

    // Fetch awards data
    const awardsResult = await session.executeQuery(`
      SELECT * FROM award;
    `);
    awards = awardsResult.resultSets[0].rows.map((row) => {
      const award_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const name = row.items[1].textValue;
      return { award_id, name };
    });

    // Fetch contests data
    const contestsResult = await session.executeQuery(`
      SELECT * FROM contest;
    `);
    contests = contestsResult.resultSets[0].rows.map((row) => {
      const contest_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const name = row.items[1].textValue;
      const tasks = row.items[2].textValue;
      const yearLong = row.items[3].int64Value;
      const year = yearLong.toInt();
      return { contest_id, name, tasks, year };
    });

    // Fetch school names data
    const schoolNamesResult = await session.executeQuery(`
      SELECT * FROM schoolname;
    `);
    schoolnames = schoolNamesResult.resultSets[0].rows.map((row) => {
      const name = row.items[0].textValue;
      const schoolname_id = row.items[1]?.bytesValue?.toString("utf8") || "";
      return { name, schoolname_id };
    });

    // Fetch participant names data
    const participantResult = await session.executeQuery(`
      SELECT * FROM participant;
    `);
    participants = participantResult.resultSets[0].rows.map((row) => {
      const country_id = row.items[0]?.bytesValue?.toString("utf8") || "";
      const name = row.items[1].textValue;
      const participant_id = row.items[2]?.bytesValue?.toString("utf8") || "";
      const participation_id = row.items[3]?.bytesValue?.toString("utf8") || "";
      const school_id = row.items[4]?.bytesValue?.toString("utf8") || "";
      return { country_id, name, participant_id, participation_id, school_id };
    });

    // Check if email exists in the database
    const user = user.find((user) => user.email === email);

    // Verify user permissions
    if (user && user.permissions === 'admin') {
      return {
        countries,
        schools,
        participations,
        awards,
        contests,
        schoolnames,
        participants,
      };
    } else {
      throw new Error('Unauthorized');
    }
  });
}

exports.handler = async (event, context) => {
  const idToken = event.headers['Authorization'].split('Bearer ')[1];

  try {
    // Verify the ID token
    const clientId = 'your-client-id'; // Replace with your actual client ID
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const email = ticket.getPayload().email;

    // Fetch data and check user authorization
    const data = await fetchData(email);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }
};