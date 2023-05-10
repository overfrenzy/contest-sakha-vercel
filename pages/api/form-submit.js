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

    // Create the Participant table if it does not exist
    await client.query(
      "CREATE TABLE IF NOT EXISTS Participant (ID INT DEFAULT unique_rowid(), Name STRING, CONSTRAINT primary_key PRIMARY KEY (ID));"
    );

    // Insert the data into the Participant table
    const { name } = req.body;
    await client.query("INSERT INTO Participant (Name) VALUES ($1)", [name]);

    // Insert the data into the Task table
    const { taskName, taskValue, taskSolved } = req.body;
    await client.query(
      "INSERT INTO Task (Name, Value, Solved) VALUES ($1, $2, $3)",
      [taskName, taskValue, taskSolved]
    );

    // Insert the data into the Placement table
    const { placementTime, placementTotal } = req.body;
    await client.query("INSERT INTO Placement (Time, Total) VALUES ($1, $2)", [
      placementTime,
      placementTotal,
    ]);

    // Insert the data into the Country table
    const { countryName } = req.body;
    await client.query("INSERT INTO Country (Name) VALUES ($1)", [countryName]);

    // Insert the data into the SchoolName table
    const { schoolName } = req.body;
    await client.query("INSERT INTO SchoolName (Name) VALUES ($1)", [
      schoolName,
    ]);

    // Insert the data into the Contest table
    const { contestName, contestYear } = req.body;
    await client.query("INSERT INTO Contest (Name, Year) VALUES ($1, $2)", [
      contestName,
      contestYear,
    ]);

    // Insert the data into the ContestTasks table
    const { contestTasksNumber } = req.body;
    await client.query("INSERT INTO ContestTasks (Number) VALUES ($1)", [
      contestTasksNumber,
    ]);

    // Insert the data into the Result table
    const { resultGrade, resultTry, resultTime } = req.body;
    await client.query(
      "INSERT INTO Result (Grade, Try, Time) VALUES ($1, $2, $3)",
      [resultGrade, resultTry, resultTime]
    );

    // Insert the data into the Award table
    const { awardName } = req.body;
    await client.query("INSERT INTO Award (Name) VALUES ($1)", [awardName]);

    res.status(200).json({ message: "Data inserted successfully" });

    await client.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while inserting data" });
  }
}
