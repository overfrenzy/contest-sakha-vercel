const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function fetchData() {
  let countries, schools, participations, awards, contests;

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
      const schoolname = row.items[1].textValue;
      return { school_id, schoolname };
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
  });

  return {
    countries,
    schools,
    participations,
    awards,
    contests,
    participants,
  };
}

exports.handler = async (event, context) => {
  const data = await fetchData();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
