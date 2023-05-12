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

    const preparedQuery = `
  UPSERT INTO Country (name) VALUES (?);
  UPSERT INTO Schoolname (name) VALUES (?);
  UPSERT INTO Contest (name, year, tasks) VALUES (?, ?, ?);
  UPSERT INTO Award (name) VALUES (?);

  DECLARE $country_id AS Int32;
  SELECT id INTO $country_id FROM Country WHERE name = ?;

  DECLARE $schoolname_id AS Int32;
  SELECT id INTO $schoolname_id FROM Schoolname WHERE name = ?;

  UPSERT INTO School (schoolName_id) VALUES (?);
  DECLARE $school_id AS Int32;
  SELECT id INTO $school_id FROM School WHERE schoolName_id = ?;

  DECLARE $contest_id AS Int32;
  SELECT id INTO $contest_id FROM Contest WHERE name = ? AND year = ?;

  UPSERT INTO Participation (contest) VALUES (?);
  DECLARE $participation_id AS Int32;
  SELECT id INTO $participation_id FROM Participation WHERE contest = ?;

  UPSERT INTO Participant (Name, Country, School, Participation, Award)
  VALUES (?, ?, ?, ?, ?);
`;

    await tableClient.withSession(async (session) => {
      const preparedStatement = await session.prepareQuery(preparedQuery);
      await session.transaction(async (tx) => {
        await tx.executeQuery(preparedStatement, [
          country,
          school,
          contest.name,
          contest.year,
          JSON.stringify(contest.tasks),
          award,
          country,
          school,
          school,
          contest.name,
          contest.year,
          contest.year,
        ]);
      });
    });

    return res.status(201).json({ message: "Participant added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
