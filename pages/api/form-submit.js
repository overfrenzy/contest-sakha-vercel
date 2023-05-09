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
      "CREATE TABLE IF NOT EXISTS Participant (ID INT PRIMARY KEY DEFAULT unique_rowid(), Name STRING)"
    );

    // Insert the data into the Participant table
    const { name } = req.body;
    await client.query("INSERT INTO Participant (Name) VALUES ($1)", [name]);

    res.status(200).json({ message: "Data inserted successfully" });

    await client.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while inserting data" });
  }
}
