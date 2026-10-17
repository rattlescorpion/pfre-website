
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Pool } from 'pg';

const COOKIE_NAME = '__Host-pfre_session';
const MAX_BODY_BYTES = 100_000;
const ALLOWED_ROLES = new Set(['super_admin', 'admin', 'owner']);

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

function getCookie(req, name) {
  const header = req.headers.cookie || '';

  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 1) continue;

    if (part.slice(0, index).trim() === name) {
      return part.slice(index + 1).trim();
    }
  }

  return '';
}

function verifySession(req) {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    return {
      ok: false,
      status: 503,
      message: 'Server authentication is not configured.'
    };
  }

  const token = getCookie(req, COOKIE_NAME);

  if (!token || token.length > 4096) {
    return {
      ok: false,
      status: 401,
      message: 'Please sign in before publishing a property.'
    };
  }

  const separator = token.lastIndexOf('.');

  if (separator < 1 || separator === token.length - 1) {
    return {
      ok: false,
      status: 401,
      message: 'Invalid session. Please sign in again.'
    };
  }

  const encodedPayload = token.slice(0, separator);
  const suppliedSignature = Buffer.from(token.slice(separator + 1));
  const expectedSignature = Buffer.from(
    createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url')
  );

  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return {
      ok: false,
      status: 401,
      message: 'Invalid session. Please sign in again.'
    };
  }

  let payload;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    );
  } catch {
    return {
      ok: false,
      status: 401,
      message: 'Invalid session. Please sign in again.'
    };
  }

  if (
    !payload ||
    typeof payload.email !== 'string' ||
    !ALLOWED_ROLES.has(payload.role) ||
    !Number.isInteger(payload.exp) ||
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    return {
      ok: false,
      status: 401,
      message: 'Session expired. Please sign in again.'
    };
  }

  return {
    ok: true,
    user: {
      email: payload.email,
      role: payload.role
    }
  };
}

function checkSameOrigin(req) {
  const origin = req.headers.origin;

  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestHost = String(
      req.headers['x-forwarded-host'] || req.headers.host || ''
    )
      .split(',')[0]
      .trim()
      .toLowerCase();

    return (
      originUrl.protocol === 'https:' &&
      Boolean(requestHost) &&
      originUrl.host.toLowerCase() === requestHost
    );
  } catch {
    return false;
  }
}

function textField(value, name, maxLength, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${name} is required.`);
    return '';
  }

  if (typeof value !== 'string') {
    throw new Error(`${name} must be text.`);
  }

  const result = value.trim();

  if (required && !result) {
    throw new Error(`${name} is required.`);
  }

  if (result.length > maxLength) {
    throw new Error(`${name} exceeds the allowed length.`);
  }

  return result;
}

function integerField(value, name, min, max, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const number = Number(value);

  if (
    !Number.isSafeInteger(number) ||
    number < min ||
    number > max
  ) {
    throw new Error(`${name} must be a valid whole number.`);
  }

  return number;
}

function imageField(value) {
  if (value === undefined || value === null) {
    return ['/images/og-banner.jpg'];
  }

  if (!Array.isArray(value) || value.length > 10) {
    throw new Error('Provide no more than 10 images.');
  }

  const images = value.map((item) => {
    if (typeof item !== 'string' || item.length > 2048) {
      throw new Error('An image path is invalid.');
    }

    const image = item.trim();

    if (
      image.startsWith('/') &&
      !image.startsWith('//') &&
      !image.split('/').includes('..')
    ) {
      return image;
    }

    let parsed;

    try {
      parsed = new URL(image);
    } catch {
      throw new Error('Images must be local paths or HTTPS URLs.');
    }

    if (parsed.protocol !== 'https:') {
      throw new Error('External image URLs must use HTTPS.');
    }

    return parsed.toString();
  });

  return images.length ? images : ['/images/og-banner.jpg'];
}

function stringArray(value, name, maxItems = 30) {
  if (value === undefined || value === null) return [];

  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(`${name} contains too many items.`);
  }

  return value.map((item) => {
    if (typeof item !== 'string' || item.length > 100) {
      throw new Error(`${name} contains an invalid item.`);
    }

    return item.trim();
  }).filter(Boolean);
}

function normalizeProperty(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('A property object is required.');
  }

  const locality = textField(input.locality, 'Locality', 128, true);
  const id = input.id === undefined
    ? `pfre-${Date.now().toString(36)}`
    : textField(input.id, 'ID', 64, true);

  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error('Property ID contains invalid characters.');
  }

  const intent = ['buy', 'rent', 'commercial'].includes(input.intent)
    ? input.intent
    : 'buy';

  const createdAt = input.createdAt
    ? new Date(input.createdAt)
    : new Date();

  if (Number.isNaN(createdAt.getTime())) {
    throw new Error('The property date is invalid.');
  }

  return {
    id,
    title: textField(input.title, 'Title', 255, true),
    intent,
    bhk: integerField(input.bhk, 'BHK', 0, 20, 2),
    locality,
    address: textField(
      input.address || `${locality}, Mumbai`,
      'Address',
      500
    ),
    priceDisplay: textField(
      input.priceDisplay,
      'Display price',
      64,
      true
    ),
    priceNumeric: integerField(
      input.priceNumeric,
      'Numeric price',
      0,
      9_000_000_000_000
    ),
    carpetArea: integerField(
      input.carpetArea,
      'Carpet area',
      0,
      1_000_000
    ),
    bathrooms: integerField(input.bathrooms, 'Bathrooms', 0, 30, 2),
    floor: textField(input.floor || 'Not specified', 'Floor', 64),
    reraId: textField(input.reraId || '', 'RERA ID', 64),
    featured: input.featured === true,
    images: imageField(input.images),
    amenities: stringArray(input.amenities, 'Amenities'),
    createdAt: createdAt.toISOString()
  };
}

async function saveToDatabase(property) {
  if (!pool) {
    throw new Error('PostgreSQL is not configured.');
  }

  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        intent VARCHAR(32) NOT NULL,
        bhk INTEGER DEFAULT 2,
        locality VARCHAR(128) NOT NULL,
        address TEXT,
        price_display VARCHAR(64) NOT NULL,
        price_numeric BIGINT DEFAULT 0,
        carpet_area INTEGER DEFAULT 0,
        bathrooms INTEGER DEFAULT 2,
        floor VARCHAR(64),
        rera_id VARCHAR(64),
        featured BOOLEAN DEFAULT FALSE,
        images JSONB DEFAULT '[]'::jsonb,
        amenities JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      INSERT INTO properties (
        id, title, intent, bhk, locality, address, price_display,
        price_numeric, carpet_area, bathrooms, floor, rera_id,
        featured, images, amenities, created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        intent = EXCLUDED.intent,
        bhk = EXCLUDED.bhk,
        locality = EXCLUDED.locality,
        address = EXCLUDED.address,
        price_display = EXCLUDED.price_display,
        price_numeric = EXCLUDED.price_numeric,
        carpet_area = EXCLUDED.carpet_area,
        bathrooms = EXCLUDED.bathrooms,
        floor = EXCLUDED.floor,
        rera_id = EXCLUDED.rera_id,
        featured = EXCLUDED.featured,
        images = EXCLUDED.images,
        amenities = EXCLUDED.amenities
    `, [
      property.id,
      property.title,
      property.intent,
      property.bhk,
      property.locality,
      property.address,
      property.priceDisplay,
      property.priceNumeric,
      property.carpetArea,
      property.bathrooms,
      property.floor,
      property.reraId,
      property.featured,
      JSON.stringify(property.images),
      JSON.stringify(property.amenities),
      property.createdAt
    ]);

    return true;
  } finally {
    client.release();
  }
}

async function saveToGitHub(property) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;

  if (!token || !owner || !repo) {
    throw new Error('GitHub backup is not configured.');
  }

  const fileUrl =
    `https://api.github.com/repos/${encodeURIComponent(owner)}/` +
    `${encodeURIComponent(repo)}/contents/data/properties.json`;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'PFRE-Admin-Portal'
  };

  const response = await fetch(fileUrl, { headers });

  let properties = [];
  let sha;

  if (response.ok) {
    const data = await response.json();
    sha = data.sha;

    if (typeof data.content !== 'string') {
      throw new Error('Property catalog could not be read.');
    }

    try {
      properties = JSON.parse(
        Buffer.from(data.content, 'base64').toString('utf8')
      );
    } catch {
      throw new Error('Property catalog contains invalid JSON.');
    }

    if (!Array.isArray(properties)) {
      throw new Error('Property catalog has an invalid format.');
    }
  } else if (response.status !== 404) {
    throw new Error(`GitHub read failed with HTTP ${response.status}.`);
  }

  properties = properties.filter(
    (item) => item && item.id !== property.id
  );
  properties.unshift(property);

  const update = await fetch(fileUrl, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Back up property ${property.id}`,
      content: Buffer.from(
        JSON.stringify(properties, null, 2),
        'utf8'
      ).toString('base64'),
      ...(sha ? { sha } : {})
    })
  });

  if (!update.ok) {
    console.error('GitHub property backup failed with HTTP', update.status);
    throw new Error('GitHub could not back up the property.');
  }

  return true;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return respond(res, 405, {
      success: false,
      message: 'Method not allowed.'
    });
  }

  if (!checkSameOrigin(req)) {
    return respond(res, 403, {
      success: false,
      message: 'Cross-origin requests are not allowed.'
    });
  }

  const auth = verifySession(req);

  if (!auth.ok) {
    return respond(res, auth.status, {
      success: false,
      message: auth.message
    });
  }

  const contentLengthHeader = req.headers['content-length'];
  const contentLength = contentLengthHeader === undefined
    ? 0
    : Number(contentLengthHeader);

  if (
    !Number.isFinite(contentLength) ||
    contentLength < 0 ||
    contentLength > MAX_BODY_BYTES
  ) {
    return respond(res, 413, {
      success: false,
      message: 'Request body is too large or invalid.'
    });
  }

  let body = req.body;

  if (typeof body === 'string') {
    if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
      return respond(res, 413, {
        success: false,
        message: 'Request body is too large.'
      });
    }

    try {
      body = JSON.parse(body);
    } catch {
      return respond(res, 400, {
        success: false,
        message: 'Request body must be valid JSON.'
      });
    }
  } else if (body !== undefined && body !== null) {
    let serialized;

    try {
      serialized = JSON.stringify(body);
    } catch {
      return respond(res, 400, {
        success: false,
        message: 'Request body is invalid.'
      });
    }

    if (
      typeof serialized !== 'string' ||
      Buffer.byteLength(serialized, 'utf8') > MAX_BODY_BYTES
    ) {
      return respond(res, 413, {
        success: false,
        message: 'Request body is too large.'
      });
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return respond(res, 400, {
      success: false,
      message: 'Request body must be a JSON object.'
    });
  }

  try {
    const property = normalizeProperty(body.property);

    // PostgreSQL is authoritative: do not attempt GitHub if this save fails.
    try {
      await saveToDatabase(property);
    } catch (error) {
      console.error(
        'PostgreSQL property save failed:',
        error?.message || 'Unknown error'
      );

      return respond(res, 500, {
        success: false,
        message: 'Property could not be saved to PostgreSQL.'
      });
    }

    // GitHub is attempted only after PostgreSQL confirms the save.
    try {
      await saveToGitHub(property);

      return respond(res, 200, {
        success: true,
        message: 'Property saved to PostgreSQL and backed up to GitHub.',
        property,
        storage: {
          database: true,
          github: true
        }
      });
    } catch (error) {
      console.error(
        'GitHub property backup failed:',
        error?.message || 'Unknown error'
      );

      return respond(res, 200, {
        success: true,
        message: 'Property saved to PostgreSQL, but the GitHub backup failed. Please check backup configuration.',
        property,
        storage: {
          database: true,
          github: false
        }
      });
    }
  } catch (error) {
    if (
      error instanceof Error &&
      /required|must be|invalid|exceeds|contains|images|image|title|locality|price|address|BHK|area|floor|RERA|amenities/i.test(
        error.message
      )
    ) {
      return respond(res, 400, {
        success: false,
        message: error.message
      });
    }

    console.error(
      'Property publishing failed:',
      error?.message || 'Unknown error'
    );

    return respond(res, 500, {
      success: false,
      message: 'An internal error occurred while publishing the property.'
    });
  }
}