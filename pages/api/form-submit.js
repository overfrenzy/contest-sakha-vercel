import { Client } from "pg";
import parse from "pg-connection-string";

const config = parse(process.env.DATABASE_URL);

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

export default async function handler(req, res) {
  try {
    await client.connect();

    // Create the tables if they do not exist
    await client.query(
      `CREATE TABLE IF NOT EXISTS Participant (ID INT DEFAULT unique_rowid(), Name STRING, CONSTRAINT primary_key PRIMARY KEY (ID));
       CREATE TABLE IF NOT EXISTS Task (ID INT DEFAULT unique_rowid(), Name STRING, Value STRING, Solved BOOLEAN, CONSTRAINT primary_key PRIMARY KEY (ID));
       CREATE TABLE IF NOT EXISTS Placement (ID INT DEFAULT unique_rowid(), Time INT, Total INT, CONSTRAINT primary_key PRIMARY KEY (ID));
       CREATE TABLE IF NOT EXISTS Country (ID INT DEFAULT unique_rowid(), Name STRING, CONSTRAINT primary_key PRIMARY KEY (ID));
       CREATE TABLE IF NOT EXISTS SchoolName (ID INT DEFAULT unique_rowid(), Name STRING, CONSTRAINT primary_key PRIMARY KEY (ID));
       CREATE TABLE IF NOT EXISTS Contest (ID INT DEFAULT unique_rowid(), Name STRING, Year INT, CONSTRAINT primary_key PRIMARY KEY (ID));
       CREATE TABLE IF NOT EXISTS ContestTasks (ID INT DEFAULT unique_rowid(), Number STRING, CONSTRAINT primary_key PRIMARY KEY (ID));
       CREATE TABLE IF NOT EXISTS Result (ID INT DEFAULT unique_rowid(), Grade INT, Try INT, Time INT, CONSTRAINT primary_key PRIMARY KEY (ID));
       CREATE TABLE IF NOT EXISTS Award (ID INT DEFAULT unique_rowid(), Name STRING, CONSTRAINT primary_key PRIMARY KEY (ID));`
    );

    // Insert the data into the tables
    const {
      name,
      taskName,
      taskValue,
      taskSolved,
      placementTime,
      placementTotal,
      countryName,
      schoolName,
      contestName,
      contestYear,
      contestTasksNumber,
      resultGrade,
      resultTry,
      resultTime,
      awardName,
    } = req.body;
    await client.query("INSERT INTO Participant (Name) VALUES ($1)", [name]);
    await client.query(
      "INSERT INTO Task (Name, Value, Solved) VALUES ($1, $2, $3)",
      [taskName, taskValue, taskSolved]
    );
    await client.query("INSERT INTO Placement (Time, Total) VALUES ($1, $2)", [
      placementTime,
      placementTotal,
    ]);
    await client.query("INSERT INTO Country (Name) VALUES ($1)", [countryName]);
    await client.query("INSERT INTO SchoolName (Name) VALUES ($1)", [
      schoolName,
    ]);
    await client.query("INSERT INTO Contest (Name, Year) VALUES ($1, $2)", [
      contestName,
      contestYear,
    ]);
    await client.query("INSERT INTO ContestTasks (Number) VALUES ($1)", [
      contestTasksNumber,
    ]);
    await client.query(
      "INSERT INTO Result (Grade, Try, Time) VALUES ($1, $2, $3)",
      [resultGrade, resultTry, resultTime]
    );
    await client.query("INSERT INTO Award (Name) VALUES ($1)", [awardName]);

    res.status(200).json({ message: "Data inserted successfully" });

    await client.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while inserting data" });
  }
}
