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
    const { id, name } = req.body;
    await client.query("INSERT INTO Participant (Name) VALUES ($1)", [
      name,
    ]);

    res.status(200).json({ message: "Data inserted successfully" });

    client.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while inserting data" });
  }
}
