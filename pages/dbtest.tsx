import { GetServerSideProps } from "next";
import { Pool } from "pg";

export default function Db({ isConnected }) {
  return (
    <div>
      <h1>Database Connection Status</h1>
      {isConnected ? (
        <p>The connection to the database is successful.</p>
      ) : (
        <p>The connection to the database has failed.</p>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
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

  try {
    const client = await pool.connect();
    client.release();
    return { props: { isConnected: true } };
  } catch (error) {
    return { props: { isConnected: false } };
  } finally {
    await pool.end();
  }
};
