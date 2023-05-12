import { Driver, TableClient, getCredentialsFromEnv } from "ydb-sdk";

const endpoint = process.env.YDB_ENDPOINT;
const database = process.env.YDB_DATABASE;
const authService = getCredentialsFromEnv();

async function initializeTables(tableClient) {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS Country (
      id SERIAL PRIMARY KEY,
      name Utf8 NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Schoolname (
      id SERIAL PRIMARY KEY,
      name Utf8 NOT NULL
    );

    CREATE TABLE IF NOT EXISTS School (
      id SERIAL PRIMARY KEY,
      schoolName_id Int32 REFERENCES Schoolname(id)
    );

    CREATE TABLE IF NOT EXISTS Contest (
      id SERIAL PRIMARY KEY,
      name Utf8 NOT NULL,
      year Int32 NOT NULL,
      tasks Json
    );

    CREATE TABLE IF NOT EXISTS Participation (
      id SERIAL PRIMARY KEY,
      contest Int32 REFERENCES Contest(id)
    );

    CREATE TABLE IF NOT EXISTS Award (
      id SERIAL PRIMARY KEY,
      name Utf8 NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Participant (
      id SERIAL PRIMARY KEY,
      Name Utf8 NOT NULL,
      Country Int32 REFERENCES Country(id),
      School Int32 REFERENCES School(id),
      Participation Int32 REFERENCES Participation(id),
      Award Int32 REFERENCES Award(id)
    );
  `;

  await tableClient.withSession(async (session) => {
    await session.executeQuery(createTablesQuery);
  });
}

export default async function handler(req, res) {
  const { name, country, school, contest, award } = req.body;
  if (!name || !country || !school || !contest || !award) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const driver = new Driver(database, endpoint, authService, { logger: console });
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
        const [countryIdResult, schoolnameIdResult, contestIdResult, awardIdResult] = await tx.executeQuery(getIdStatement, [
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
        const insertSchoolAndParticipationStatement = await session.prepareQuery(insertSchoolAndParticipationQuery);
        await tx.executeQuery(insertSchoolAndParticipationStatement, [schoolname_id, contest_id]);

        // Retrieve School and Participation IDs
        const getSchoolAndParticipationIdQuery = `
          SELECT id FROM School WHERE schoolName_id = ?;
          SELECT id FROM Participation WHERE contest = ?;
        `;
        const getSchoolAndParticipationIdStatement = await session.prepareQuery(getSchoolAndParticipationIdQuery);
        const [schoolIdResult, participationIdResult] = await tx.executeQuery(getSchoolAndParticipationIdStatement, [schoolname_id, contest_id]);

        const school_id = schoolIdResult[0].id;
        const participation_id = participationIdResult[0].id;

        // Insert data into Participant table
        const insertParticipantQuery = `
          UPSERT INTO Participant (Name, Country, School, Participation, Award)
          VALUES (?, ?, ?, ?, ?);
        `;
        const insertParticipantStatement = await session.prepareQuery(insertParticipantQuery);
        await tx.executeQuery(insertParticipantStatement, [name, country_id, school_id, participation_id, award_id]);
      });
    });

    return res.status(201).json({ message: "Participant added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
