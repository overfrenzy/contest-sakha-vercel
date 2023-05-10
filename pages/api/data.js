import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 40, // Maximum number of connections in the pool
  keepAlive: {
    interval: 150000, // Interval to periodically check if connections are valid
  },
});

export default async function handler(req, res) {
  try {
    const result = await pool.query(`
  SELECT
    p.id,
    p.Name,
    p.Name AS name,
    c.name AS country_name,
    sn.name AS school_name,
    ct.name AS contest_name,
    ct.year AS contest_year,
    a.name AS award_name
  FROM
    Participant p
    LEFT JOIN Country c ON p.Country = c.id
    LEFT JOIN School s ON p.School = s.id
    LEFT JOIN Schoolname sn ON s.schoolName_id = sn.id
    LEFT JOIN Participation pt ON p.Participation = pt.id
    LEFT JOIN Contest ct ON pt.contest = ct.id
    LEFT JOIN Award a ON p.Award = a.id
`);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//In the DatabaseTest component, the participants array is expected to contain objects with properties such as name, country, school, participation, and award