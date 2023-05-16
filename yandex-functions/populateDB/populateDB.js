const { Driver, getCredentialsFromEnv, getLogger } = require("ydb-sdk");
const express = require("express");
const serverlessHttp = require("serverless-http");

const logger = getLogger({ level: "debug" });
const endpoint = "grpcs://ydb.serverless.yandexcloud.net:2135";
const database = "/ru-central1/b1g85kiukao953hcpo4a/etn7m4auvt13hjahr714";
const authService = getCredentialsFromEnv();

async function initializeTables(tableClient) {
  const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS Country (
    id Uint64,
    name Utf8 NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Schoolname (
    id Uint64,
    name Utf8 NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS School (
    id Uint64,
    schoolName_id Uint64,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Contest (
    id Uint64,
    name Utf8 NOT NULL,
    year Uint32 NOT NULL,
    tasks Json,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Participation (
    id Uint64,
    contest Uint64,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Award (
    id Uint64,
    name Utf8 NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Participant (
    id Uint64,
    Name Utf8 NOT NULL,
    Country Uint64,
    School Uint64,
    Participation Uint64,
    Award Uint64,
    PRIMARY KEY (id)
);
  `;

  await tableClient.withSession(async (session) => {
    await session.executeQuery(createTablesQuery);
  });
}

const formSubmitHandler = async function (req, res) {
  const { name, country, school, contest, award } = req.body;
  if (!name || !country || !school || !contest || !award) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const driver = new Driver({ endpoint, database, authService });
    const timeout = 10000;
    if (!(await driver.ready(timeout))) {
      console.error(`Driver has not become ready in \${timeout}ms!`);
      return res.status(500).json({ error: "Driver initialization failed" });
    }

    const tableClient = new TableClient(driver);
    await initializeTables(tableClient);

    await tableClient.withSession(async (session) => {
      await session.transaction(async (tx) => {
        // Insert data into Country, Schoolname, Contest, and Award tables
        const insertDataQuery = `
          UPSERT INTO Country (name) VALUES (?);
          UPSERT INTO Schoolname (name) VALUES (?);
          UPSERT INTO Contest (name, year, tasks) VALUES (?, ?, ?);
          UPSERT INTO Award (name) VALUES (?);
        `;
        const insertDataStatement = await session.prepareQuery(insertDataQuery);
        await tx.executeQuery(insertDataStatement, [
          country,
          school,
          contest.name,
          contest.year,
          JSON.stringify(contest.tasks),
          award,
        ]);

        // Retrieve IDs
        const getIdQuery = `
          SELECT id FROM Country WHERE name = ?;
          SELECT id FROM Schoolname WHERE name = ?;
          SELECT id FROM Contest WHERE name = ? AND year = ?;
          SELECT id FROM Award WHERE name = ?;
        `;
        const getIdStatement = await session.prepareQuery(getIdQuery);
        const [
          countryIdResult,
          schoolnameIdResult,
          contestIdResult,
          awardIdResult,
        ] = await tx.executeQuery(getIdStatement, [
          country,
          school,
          contest.name,
          contest.year,
          award,
        ]);

        const country_id = countryIdResult[0].id;
        const schoolname_id = schoolnameIdResult[0].id;
        const contest_id = contestIdResult[0].id;
        const award_id = awardIdResult[0].id;

        // Insert data into School and Participation tables
        const insertSchoolAndParticipationQuery = `
          UPSERT INTO School (schoolName_id) VALUES (?);
          UPSERT INTO Participation (contest) VALUES (?);
        `;
        const insertSchoolAndParticipationStatement =
          await session.prepareQuery(insertSchoolAndParticipationQuery);
        await tx.executeQuery(insertSchoolAndParticipationStatement, [
          schoolname_id,
          contest_id,
        ]);

        // Retrieve School and Participation IDs
        const getSchoolAndParticipationIdQuery = `
          SELECT id FROM School WHERE schoolName_id = ?;
          SELECT id FROM Participation WHERE contest = ?;
        `;
        const getSchoolAndParticipationIdStatement = await session.prepareQuery(
          getSchoolAndParticipationIdQuery
        );
        const [schoolIdResult, participationIdResult] = await tx.executeQuery(
          getSchoolAndParticipationIdStatement,
          [schoolname_id, contest_id]
        );

        const school_id = schoolIdResult[0].id;
        const participation_id = participationIdResult[0].id;

        // Insert data into Participant table
        const insertParticipantQuery = `
          UPSERT INTO Participant (Name, Country, School, Participation, Award)
          VALUES (?, ?, ?, ?, ?);
        `;
        const insertParticipantStatement = await session.prepareQuery(
          insertParticipantQuery
        );
        await tx.executeQuery(insertParticipantStatement, [
          name,
          country_id,
          school_id,
          participation_id,
          award_id,
        ]);
      });
    });

    return res.status(201).json({ message: "Participant added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.post("/submit", formSubmitHandler);

exports.handler = serverlessHttp(app);
