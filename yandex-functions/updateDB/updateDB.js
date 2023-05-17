const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

const updateTables = async (
  session,
  { award, country, school, participation, contest, schoolname }
) => {
  const upsertAwardQuery = `
      UPSERT INTO Awards (id, award)
      VALUES (:id, :award);
    `;
  const upsertCountryQuery = `
      UPSERT INTO Countries (id, country)
      VALUES (:id, :country);
    `;
  const upsertSchoolQuery = `
      UPSERT INTO Schools (id, school)
      VALUES (:id, :school);
    `;
  const upsertParticipationQuery = `
      UPSERT INTO Participations (id, participation)
      VALUES (:id, :participation);
    `;
  const upsertContestQuery = `
    UPSERT INTO Participations (id, contest)
    VALUES (:id, :contest);
  `;
  const upsertSchoolNameQuery = `
    UPSERT INTO Schools (id, schoolname)
    VALUES (:id, :schoolname);
  `;

  const queries = [
    { query: upsertAwardQuery, params: { id: Type.String().random(), award: Type.String().value(award) }, },
    { query: upsertCountryQuery, params: { id: Type.String().random(), country: Type.String().value(country), }, },
    { query: upsertSchoolQuery, params: { id: Type.String().random(), school: Type.String().value(school), }, },
    { query: upsertParticipationQuery, params: { id: Type.String().random(), participation: Type.String().value(participation), }, },
    { query: upsertContestQuery, params: { id: Type.String().random(), contest: Type.String().value(contest), }, },
    { query: upsertSchoolNameQuery, params: { id: Type.String().random(), schoolname: Type.String().value(schoolname), }, },
  ];

  for (const { query, params } of queries) {
    await session.executePreparedStatement(query, params);
  }
};

exports.handler = async (event, context) => {
  try {
    if (!(await driver.ready(10000))) {
      logger.fatal("Driver has not become ready in 10 seconds!");
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error" }),
      };
    }

    const session = await driver.tableClient.withSession(async (session) => {
      if (event.httpMethod === "POST") {
        const { award, country, school, participation } = JSON.parse(
          event.body
        );
        await updateTables(session, { award, country, school, participation });
        return {
          statusCode: 200,
          body: JSON.stringify({ message: "Tables updated successfully." }),
        };
      } else {
        return {
          statusCode: 405,
          body: JSON.stringify({ message: "Method Not Allowed" }),
          headers: { Allow: "POST" },
        };
      }
    });

    return session;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
