import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 40, // Maximum number of connections in the pool
  keepAlive: {
    interval: 150000 // Interval to periodically check if connections are valid
  }
});

export default pool;
