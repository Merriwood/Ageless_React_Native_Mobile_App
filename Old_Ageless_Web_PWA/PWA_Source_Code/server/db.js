import pg from "pg";
const { Pool } = pg;

// Lazy-initialize pool to ensure DATABASE_URL is loaded from dotenv first
let pool = null;

function getPool() {
  if (!pool) {
    // Always enable SSL for hosted Postgres unless explicitly disabled
    const needSSL = (() => {
      if (process.env.FORCE_DB_SSL === 'false') return false;
      if (!process.env.DATABASE_URL) return false;
      // Assume remote providers require SSL
      return /render|amazonaws|heroku|digitalocean|azure|google/i.test(process.env.DATABASE_URL);
    })();

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: needSSL ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}
