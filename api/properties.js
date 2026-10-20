
import { Pool } from 'pg';

const MAX_LIMIT = 100;

let pool;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString:
      process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl:
      process.env.PGSSLMODE === 'disable'
        ? false
        : { rejectUnauthorized: true },
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000
  });
}

function respond(res, status, data) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(data);
}

function normalizeRow(row) {
  return {
    id: row.id,
    title: row.title,
    intent: row.intent,
    bhk: Number(row.bhk ?? 2),
    locality: row.locality,
    address: row.address ?? '',
    priceDisplay: row.price_display,
    priceNumeric: Number(row.price_numeric ?? 0),
    carpetArea: Number(row.carpet_area ?? 0),
    bathrooms: Number(row.bathrooms ?? 2),
    floor: row.floor ?? 'Not specified',
    reraId: row.rera_id ?? '',
    featured: row.featured === true,
    images: Array.isArray(row.images) ? row.images : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : null
  };
}

async function readFromPostgres(limit) {
  const result = await pool.query(
    `SELECT
       id, title, intent, bhk, locality, address,
       price_display, price_numeric, carpet_area,
       bathrooms, floor, rera_id, featured,
       images, amenities, created_at
     FROM properties
     ORDER BY created_at DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );

  return result.rows.map(normalizeRow);
}

async function readFromGitHub(limit) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    throw new Error('GitHub storage is not configured.');
  }

  const url =
    `https://api.github.com/repos/${encodeURIComponent(owner)}/` +
    `${encodeURIComponent(repo)}/contents/data/properties.json` +
    `?ref=${encodeURIComponent(branch)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PFRE-Property-Reader'
    },
    cache: 'no-store'
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`GitHub returned HTTP ${response.status}.`);
  }

  const file = await response.json();

  if (
    file.encoding !== 'base64' ||
    typeof file.content !== 'string'
  ) {
    throw new Error('Unexpected GitHub property-file format.');
  }

  let properties;

  try {
    properties = JSON.parse(
      Buffer.from(file.content, 'base64').toString('utf8')
    );
  } catch {
    throw new Error('The GitHub property file contains invalid JSON.');
  }

  if (!Array.isArray(properties)) {
    throw new Error('The GitHub property file must contain an array.');
  }

  return properties.slice(0, limit);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');

    return respond(res, 405, {
      success: false,
      message: 'Method not allowed.'
    });
  }

  const rawLimit = req.query?.limit;
  let limit = 50;

  if (rawLimit !== undefined) {
    const value = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;

    if (
      typeof value !== 'string' ||
      !/^\d+$/.test(value) ||
      Number(value) < 1 ||
      Number(value) > MAX_LIMIT
    ) {
      return respond(res, 400, {
        success: false,
        message: `Limit must be between 1 and ${MAX_LIMIT}.`
      });
    }

    limit = Number(value);
  }

  try {
    const properties = pool
      ? await readFromPostgres(limit)
      : await readFromGitHub(limit);

    return respond(res, 200, {
      success: true,
      count: properties.length,
      properties
    });
  } catch (error) {
    console.error(
      'Property read failed:',
      error?.message || 'Unknown error'
    );

    return respond(res, 500, {
      success: false,
      message: 'Unable to load property listings.'
    });
  }
}