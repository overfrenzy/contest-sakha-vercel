const { Driver, getCredentialsFromEnv, Session, logger } = require("ydb-sdk");
const { v4: uuidv4 } = require("uuid");
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

async function insertSchoolname(session, schoolname_id, name) {
  const query = `
    UPSERT INTO schoolname (schoolname_id, name)
    VALUES (?, ?);
  `;
  await session.executeDataQuery(query, [schoolname_id, name]);
}

async function insertCountry(session, country_id, name) {
  const query = `
    UPSERT INTO country (country_id, name)
    VALUES (?, ?);
  `;
  await session.executeDataQuery(query, [country_id, name]);
}

async function insertAward(session, award_id, name) {
  const query = `
    UPSERT INTO award (award_id, name)
    VALUES (?, ?);
  `;
  await session.executeDataQuery(query, [award_id, name]);
}

async function insertSchool(session, school_id, schoolname_id) {
  const query = `
    UPSERT INTO school (school_id, schoolname_id)
    VALUES (?, ?);
  `;
  await session.executeDataQuery(query, [school_id, schoolname_id]);
}

async function insertParticipation(session, participation_id, contest_id) {
  const query = `
    UPSERT INTO participation (participation_id, contest_id)
    VALUES (?, ?);
  `;
  await session.executeDataQuery(query, [participation_id, contest_id]);
}

async function insertContest(session, contest_id, name, year, tasks) {
  const query = `
    UPSERT INTO contest (contest_id, name, year, tasks)
    VALUES (?, ?, ?);
  `;
  await session.executeDataQuery(query, [contest_id, name, year, tasks]);
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
  await session.executeDataQuery(query, [
    participant_id,
    school_id,
    country_id,
    participation_id,
    award_id,
    name,
  ]);
}

async function insertPlacement(
  session,
  placement_id,
  participant_id,
  contest_id,
  award_id,
  tasksdone
) {
  const query = `
    UPSERT INTO placement (
      placement_id, participant_id, contest_id, award_id, tasksdone
    )
    VALUES (?, ?, ?, ?, ?);
  `;
  await session.executeDataQuery(query, [
    placement_id,
    participant_id,
    contest_id,
    award_id,
    tasksdone,
  ]);
}

async function populateData(data) {
  let tx;
  await driver.tableClient
    .withSession(async (session) => {
      try {
        tx = await session.beginTransaction({ serializableReadWrite: {} });
        const countriesMap = new Map();
        const contestsMap = new Map();
        const awardsMap = new Map();

        for (const student of data.students) {
          const { participant_en, country_en, problems1, problems2, place } =
            student;

          if (!countriesMap.has(country_en)) {
            const country_id = uuidv4();
            await insertCountry(session, country_id, country_en);
            countriesMap.set(country_en, country_id);
          }

          if (!awardsMap.has(place)) {
            const award_id = uuidv4();
            await insertAward(session, award_id, place);
            awardsMap.set(place, award_id);
          }

          const contestName = "contest";
          if (!contestsMap.has(contestName)) {
            const contest_id = uuidv4();
            await insertContest(
              session,
              contest_id,
              contestName,
              new Date().getFullYear(),
              null
            );
            contestsMap.set(contestName, contest_id);
          }

          const participant_id = uuidv4();
          const school_id = uuidv4();
          const schoolname_id = uuidv4();
          const participation_id = uuidv4();
          const placement_id = uuidv4();
          const tasksdone = JSON.stringify({ problems1, problems2 });

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
          await insertPlacement(
            session,
            placement_id,
            participant_id,
            contestsMap.get(contestName),
            awardsMap.get(place),
            tasksdone
          );
        }

        await session.commit(tx);
      } catch (error) {
        console.error("Error while populating data:", error);
        try {
          if (tx) {
            await session.rollback(tx);
            
          }
        } catch (rollbackError) {
          console.error("Error rolling back transaction:", rollbackError);
        }
      }
    })
    .catch((error) => {
      console.error("Error creating session:", error);
      if (tx) {
        session.rollback(tx).catch((rollbackError) => {
          console.error("Error rolling back transaction:", rollbackError);
        });
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
