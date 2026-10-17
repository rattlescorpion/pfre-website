
import { Pool } from 'pg';

const pool = process.env.POSTGRES_URL || process.env.DATABASE_URL
  ? new Pool({
      connectionString:
        process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl:
        process.env.PGSSLMODE === 'disable'
          ? false
          : { rejectUnauthorized: true },
      max: 1,
      connectionTimeoutMillis: 5000
    })
  : null;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    });
  }

  if (!pool) {
    return res.status(503).json({
      success: false,
      message: 'PostgreSQL environment variable is not configured.'
    });
  }

  try {
    const result = await pool.query(
      'SELECT current_database() AS database_name, NOW() AS server_time'
    );

    return res.status(200).json({
      success: true,
      message: 'PostgreSQL connection successful.',
      database: result.rows[0].database_name,
      serverTime: result.rows[0].server_time
    });
  } catch (error) {
    console.error(
      'Database diagnostic failed:',
      error?.code || 'UNKNOWN',
      error?.message || 'Unknown error'
    );

    return res.status(500).json({
      success: false,
      message: 'PostgreSQL connection failed. Check Vercel function logs.'
    });
  }
}
