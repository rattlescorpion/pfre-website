
import { Pool } from 'pg';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false });
  }

  const connectionString =
    process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    return res.status(503).json({
      success: false,
      message: 'Database configuration is missing.'
    });
  }

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    max: 1
  });

  try {
    await pool.query('SELECT 1');
    return res.status(200).json({
      success: true,
      message: 'PostgreSQL connection successful.'
    });
  } catch {
    return res.status(503).json({
      success: false,
      message: 'PostgreSQL connection failed. Check server configuration.'
    });
  } finally {
    await pool.end().catch(() => {});
  }
}