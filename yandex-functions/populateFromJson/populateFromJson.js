const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const { v4: uuidv4 } = require("uuid");
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function insertSchoolname(session, schoolname_id, name) {
  const query = `
    UPSERT INTO schoolname (schoolname_id, name)
    VALUES (?, ?);
  `;
  await session.createQuery(query).bind([schoolname_id, name]).execute();
}

async function insertCountry(session, country_id, name) {
  const query = `
    UPSERT INTO country (country_id, name)
    VALUES (?, ?);
  `;
  await session.createQuery(query).bind([country_id, name]).execute();
}

async function insertAward(session, award_id, name) {
  const query = `
    UPSERT INTO award (award_id, name)
    VALUES (?, ?);
  `;
  await session.createQuery(query).bind([award_id, name]).execute();
}

async function insertSchool(session, school_id, schoolname_id) {
  const query = `
    UPSERT INTO school (school_id, schoolname_id)
    VALUES (?, ?);
  `;
  await session.createQuery(query).bind([school_id, schoolname_id]).execute();
}

async function insertParticipation(session, participation_id, contest_id) {
  const query = `
    UPSERT INTO participation (participation_id, contest_id)
    VALUES (?, ?);
  `;
  await session
    .createQuery(query)
    .bind([participation_id, contest_id])
    .execute();
}

async function insertContest(session, contest_id, name, year, tasks) {
  const query = `
    UPSERT INTO contest (contest_id, name, year, tasks)
    VALUES (?, ?, ?, ?);
  `;
  await session
    .createQuery(query)
    .bind([contest_id, name, year, tasks])
    .execute();
}

async function insertPlacement(
  session,
  placement_id,
  participant_id,
  contest_id,
  award_id,
  time,
  total
) {
  const query = `
    UPSERT INTO placement (
      placement_id, participant_id, contest_id, award_id, time, total
    )
    VALUES (?, ?, ?, ?, ?, ?);
  `;
  await session
    .createQuery(query)
    .bind([placement_id, participant_id, contest_id, award_id, time, total])
    .execute();
}

async function insertResult(
  session,
  result_id,
  participant_id,
  contest_id,
  grade,
  trycount,
  time
) {
  const query = `
    UPSERT INTO result (
      result_id, participant_id, contest_id, grade, trycount, time
    )
    VALUES (?, ?, ?, ?, ?, ?);
  `;
  await session
    .createQuery(query)
    .bind([result_id, participant_id, contest_id, grade, trycount, time])
    .execute();
}

async function insertParticipant(
  session,
  participant_id,
  school_id,
  country_id,
  participation_id,
  award_id,
  name
) {
  const query = `
    UPSERT INTO participant (
      participant_id, school_id, country_id, participation_id, award_id, name
    )
    VALUES (?, ?, ?, ?, ?, ?);
  `;
  await session
    .createQuery(query)
    .bind([
      participant_id,
      school_id,
      country_id,
      participation_id,
      award_id,
      name,
    ])
    .execute();
}

// Main function to populate data
async function populateData(data) {
  await driver.tableClient.withSession(async (session) => {
    try {
      await session.beginTransaction({ serializableReadWrite: {} });

      const countriesMap = new Map();
      const contestsMap = new Map();
      const awardsMap = new Map();

      for (const student of data.students) {
        const { participant_en, country_en, problems1, problems2, place } =
          student;

        // Insert country if not already inserted
        if (!countriesMap.has(country_en)) {
          const country_id = uuidv4();
          await insertCountry(session, country_id, country_en);
          countriesMap.set(country_en, country_id);
        }

        // Insert award if not already inserted
        if (!awardsMap.has(place)) {
          const award_id = uuidv4();
          await insertAward(session, award_id, place);
          awardsMap.set(place, award_id);
        }

        // Insert contest if not already inserted
        const contestName = "Contest"; //
        if (!contestsMap.has(contestName)) {
          const contest_id = uuidv4();
          const tasks = { problems1, problems2 };
          await insertContest(
            session,
            contest_id,
            contestName,
            new Date().getFullYear(),
            JSON.stringify(tasks)
          );
          contestsMap.set(contestName, contest_id);
        }

        const participant_id = uuidv4();
        const school_id = uuidv4();
        const schoolname_id = uuidv4();
        const participation_id = uuidv4();
        const result_id = uuidv4();
        const placement_id = uuidv4();

        await insertSchoolname(session, schoolname_id, participant_en);
        await insertSchool(session, school_id, schoolname_id);
        await insertParticipant(
          session,
          participant_id,
          school_id,
          countriesMap.get(country_en),
          participation_id,
          awardsMap.get(place),
          participant_en
        );
        await insertParticipation(
          session,
          participation_id,
          contestsMap.get(contestName)
        );
        await insertResult(
          session,
          result_id,
          participant_id,
          contestsMap.get(contestName),
          null,
          null,
          null
        );
        await insertPlacement(
          session,
          placement_id,
          participant_id,
          contestsMap.get(contestName),
          awardsMap.get(place),
          null,
          null
        );
      }

      await session.commitTransaction();
    } catch (error) {
      console.error("Error:", error);
      if (session.currentTransaction) {
        await session.rollbackTransaction();
      }
    }
  });
}

module.exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod === "POST") {
    const data = JSON.parse(event.body);
    await populateData(data);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Data populated successfully" }),
    };
  }

  return {
    statusCode: 405,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "Method not allowed" }),
  };
};
