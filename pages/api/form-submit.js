import { Client } from "pg";
import parse from "pg-connection-string";

const config = parse(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const { name, country, school, contest, award } = req.body;

  // Validate input
  if (!name || !country || !school || !contest || !award) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const client = new Client({
      user: config.user,
      host: config.host,
      database: config.database,
      password: config.password,
      port: config.port,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();

    // Create or update Country
    await client.query(
      `CREATE TABLE IF NOT EXISTS Country (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )`
    );

    await client.query(
      `INSERT INTO Country (name)
       SELECT \$1
       WHERE NOT EXISTS (SELECT 1 FROM Country WHERE name = \$1)`,
      [country]
    );

    const countryResult = await client.query(`SELECT id FROM Country WHERE name = \$1`, [country]);

    // Create or update Schoolname and School
    await client.query(
      `CREATE TABLE IF NOT EXISTS Schoolname (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )`
    );

    await client.query(
      `INSERT INTO Schoolname (name)
       SELECT \$1
       WHERE NOT EXISTS (SELECT 1 FROM Schoolname WHERE name = \$1)`,
      [school]
    );

    const schoolNameResult = await client.query(`SELECT id FROM Schoolname WHERE name = \$1`, [school]);

    await client.query(
      `CREATE TABLE IF NOT EXISTS School (
        id SERIAL PRIMARY KEY,
        schoolName_id INTEGER REFERENCES Schoolname(id)
      )`
    );

    await client.query(
      `INSERT INTO School (schoolName_id)
       SELECT \$1
       WHERE NOT EXISTS (SELECT 1 FROM School WHERE schoolName_id = \$1)`,
      [schoolNameResult.rows[0].id]
    );

    const schoolResult = await client.query(`SELECT id FROM School WHERE schoolName_id = \$1`, [schoolNameResult.rows[0].id]);

    // Create or update Contest and Participation
    await client.query(
      `CREATE TABLE IF NOT EXISTS Contest (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        year INTEGER NOT NULL
      )`
    );

    await client.query(
      `INSERT INTO Contest (name, year)
       SELECT \$1, \$2
       WHERE NOT EXISTS (SELECT 1 FROM Contest WHERE name = \$1 AND year = \$2)`,
      [contest.name, contest.year]
    );

    const contestResult = await client.query(`SELECT id FROM Contest WHERE name = \$1 AND year = \$2`, [contest.name, contest.year]);

    await client.query(
      `CREATE TABLE IF NOT EXISTS Participation (
        id SERIAL PRIMARY KEY,
        contest INTEGER REFERENCES Contest(id)
      )`
    );

    await client.query(
      `INSERT INTO Participation (contest)
       SELECT \$1
       WHERE NOT EXISTS (SELECT 1 FROM Participation WHERE contest = \$1)`,
      [contestResult.rows[0].id]
    );

    const participationResult = await client.query(`SELECT id FROM Participation WHERE contest = \$1`, [contestResult.rows[0].id]);

    // Create or update Award
    await client.query(
      `CREATE TABLE IF NOT EXISTS Award (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )`
    );

    await client.query(
      `INSERT INTO Award (name)
       SELECT \$1
       WHERE NOT EXISTS (SELECT 1 FROM Award WHERE name = \$1)`,
      [award]
    );

    const awardResult = await client.query(`SELECT id FROM Award WHERE name = \$1`, [award]);

    // Create Participant
    await client.query(
      `CREATE TABLE IF NOT EXISTS Participant (
        id SERIAL PRIMARY KEY,
        Name TEXT NOT NULL,
        Country INTEGER REFERENCES Country(id),
        School INTEGER REFERENCES School(id),
        Participation INTEGER REFERENCES Participation(id),
        Award INTEGER REFERENCES Award(id)
      )`
    );
    
    await client.query(
      `INSERT INTO Participant (Name, Country, School, Participation, Award)
       SELECT \$1, \$2, \$3, \$4, \$5
       WHERE NOT EXISTS (
           SELECT 1 FROM Participant
           WHERE Name = \$1 AND Country = \$2 AND School = \$3 AND Participation = \$4 AND Award = \$5
       )`,
      [
        name,
        countryResult.rows[0].id,
        schoolResult.rows[0].id,
        participationResult.rows[0].id,
        awardResult.rows[0].id,
      ]
    );

    await client.end();

    return res.status(201).json({ message: "Participant added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
