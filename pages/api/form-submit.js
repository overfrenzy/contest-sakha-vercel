import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req, res) {
  try {
    const client = await pool.connect();

    // Insert the data into the Participant table
    const { id, name, country, school, participation, award } = req.body;
    await client.query(
      "INSERT INTO Participant (Id, Name, Country, School, Participation, Award) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, name, country, school, participation, award]
    );

    res.status(200).json({ message: "Data inserted successfully" });

    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while inserting data" });
  }
}
