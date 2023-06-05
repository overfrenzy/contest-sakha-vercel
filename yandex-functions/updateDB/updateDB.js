// old absolete function

const { Driver, getCredentialsFromEnv, getLogger, Ydb } = require("ydb-sdk");
const express = require("express");
const cors = require("cors");
const serverlessHttp = require("serverless-http");

const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();
const driver = new Driver({ endpoint, database, authService });

const app = express();
app.use(cors());
app.use(express.json());

const updateTables = async (
  session,
  { award, country, school, participation, contest, schoolname, contestYear, contestTasks }
) => {
  const upsertAwardQuery = `
      UPSERT INTO award (award_id, name)
      VALUES (:id, :award);
    `;
  const upsertCountryQuery = `
      UPSERT INTO country (country_id, name)
      VALUES (:id, :country);
    `;
  const upsertSchoolQuery = `
      UPSERT INTO school (schoolname_id, school_id)
      VALUES (:id, :school);
    `;
  const upsertParticipationQuery = `
      UPSERT INTO participation (contest_id, participation_id)
      VALUES (:id, :participation);
    `;
  const upsertContestQuery = `
    UPSERT INTO contest (contest_id, name, year, tasks)
    VALUES (:id, :contest, :year, :tasks);
  `;
  const upsertSchoolNameQuery = `
    UPSERT INTO schoolname (schoolname_id, name)
    VALUES (:id, :schoolname);
  `;

  const queries = [
    { query: upsertAwardQuery, params: { id: Ydb.Type.String().random(), award: Ydb.Type.String().value(award) }, },
    { query: upsertCountryQuery, params: { id: Ydb.Type.String().random(), country: Ydb.Type.String().value(country), }, },
    { query: upsertSchoolQuery, params: { id: Ydb.Type.String().random(), school: Ydb.Type.String().value(school), }, },
    { query: upsertParticipationQuery, params: { id: Ydb.Type.String().random(), participation: Ydb.Type.String().value(participation), }, },
    { query: upsertContestQuery, params: { id: Ydb.Type.String().random(), contest: Ydb.Type.String().value(contest), year: Ydb.Type.Int64().value(contestYear), tasks: Ydb.Type.Json().value(contestTasks) }, },
    { query: upsertSchoolNameQuery, params: { id: Ydb.Type.String().random(), schoolname: Ydb.Type.String().value(schoolname), }, },
  ];

  for (const { query, params } of queries) {
    await session.executePreparedStatement(query, params);
  }
};

app.post("/", async (req, res) => {
  try {
    if (!(await driver.ready(10000))) {
      logger.fatal("Driver has not become ready in 10 seconds!");
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }

    const {
      award,
      country,
      school,
      participation,
      contest,
      schoolname,
      contestYear,
      contestTasks,
    } = req.body;
    await driver.tableClient.withSession(async (session) => {
      await updateTables(session, {
        award,
        country,
        school,
        participation,
        contest,
        schoolname,
        contestYear,
        contestTasks,
      });
    });

    res.status(200).json({ message: "Tables updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.all("*", (req, res) => {
  res.status(405).json({ message: "Method Not Allowed" });
});

const serverlessApp = serverlessHttp(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  return await serverlessApp(event, context);
};