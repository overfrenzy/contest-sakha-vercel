import { Client } from "pg";
import parse from "pg-connection-string";

const config = parse(process.env.DATABASE_URL);

export default async function handler(req, res) {
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

    // Create the Participant table and foreign keys if they do not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS Placement (
        ID SERIAL PRIMARY KEY,
        Time INT,
        Total INT
      );
      CREATE TABLE IF NOT EXISTS Country (
        ID SERIAL PRIMARY KEY,
        Name VARCHAR
      );
      CREATE TABLE IF NOT EXISTS SchoolName (
        ID SERIAL PRIMARY KEY,
        Name VARCHAR
      );
      CREATE TABLE IF NOT EXISTS Award (
        ID SERIAL PRIMARY KEY,
        Name VARCHAR
      );
      CREATE TABLE IF NOT EXISTS Participant (
        ID SERIAL PRIMARY KEY,
        Name VARCHAR,
        CountryID INT REFERENCES Country(ID),
        SchoolNameID INT REFERENCES SchoolName(ID),
        AwardID INT REFERENCES Award(ID)
      );
    `);

    // Insert the data into the Participant table
    const {
      name,
      placementTime,
      placementTotal,
      countryName,
      schoolName,
      awardName,
    } = req.body;

    // Get the foreign key IDs
    const placementResult = await client.query(
      "SELECT ID FROM Placement WHERE Time = \$1 AND Total = \$2",
      [placementTime, placementTotal]
    );
    if (placementResult.rows.length === 0) {
      throw new Error("Placement not found");
    }
    const placementId = placementResult.rows[0].ID;

    const countryResult = await client.query(
      "SELECT ID FROM Country WHERE Name = \$1",
      [countryName]
    );
    if (countryResult.rows.length === 0) {
      throw new Error("Country not found");
    }
    const countryId = countryResult.rows[0].ID;

    const schoolNameResult = await client.query(
      "SELECT ID FROM SchoolName WHERE Name = \$1",
      [schoolName]
    );
    if (schoolNameResult.rows.length === 0) {
      throw new Error("School name not found");
    }
    const schoolNameId = schoolNameResult.rows[0].ID;

    const awardResult = await client.query(
      "SELECT ID FROM Award WHERE Name = \$1",
      [awardName]
    );
    if (awardResult.rows.length === 0) {
      throw new Error("Award not found");
    }
    const awardId = awardResult.rows[0].ID;
    const insertResult = await client.query(
      "INSERT INTO Participant (Name, PlacementID, CountryID, SchoolNameID, AwardID) VALUES (\$1, \$2, \$3, \$4, \$5) RETURNING *",
      [name, placementId, countryId, schoolNameId, awardId]
    );
    const insertedParticipant = insertResult.rows[0];
    console.log("Inserted participant:", insertedParticipant);
    await client.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
}
