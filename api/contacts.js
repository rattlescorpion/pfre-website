
/**
 * api/contacts.js
 * Property Finder Real Estate - Mumbai
 *
 * Secure contact-directory API.
 * Requires the signed __Host-pfre_session cookie.
 *
 * Required environment variable:
 *   SESSION_SECRET - at least 32 characters
 *
 * Optional storage configuration:
 *   POSTGRES_URL or DATABASE_URL
 *   GITHUB_TOKEN, REPO_OWNER, REPO_NAME
 *   ALLOWED_ORIGINS - comma-separated trusted origins
 */

import { Pool } from 'pg';
import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = '__Host-pfre_session';
const FILE_PATH = 'data/contacts.json';

const SESSION_SECRET = process.env.SESSION_SECRET || '';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

const githubConfigured = Boolean(
  GITHUB_TOKEN && REPO_OWNER && REPO_NAME
);

const databaseUrl =
  process.env.POSTGRES_URL || process.env.DATABASE_URL;

let pool;

if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 3,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000
  });
}

const defaultOrigins = [
  'https://www.propertyfinderrealestate.com',
  'https://propertyfinderrealestate.com',
  'https://pfre-website.vercel.app'
];

const allowedOrigins = new Set([
  ...defaultOrigins,
  ...(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
]);

function setSecurityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Origin');
}

function checkOrigin(req, res) {
  const origin = req.headers.origin;

  // Requests without an Origin still require a valid session.
  // Browser requests with an Origin must use a trusted website.
  if (origin && !allowedOrigins.has(origin)) {
    res.status(403).json({
      success: false,
      error: 'Origin not permitted.'
    });
    return false;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  return true;
}

function getCookie(req, cookieName) {
  const cookieHeader = req.headers.cookie || '';

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');

    if (separator === -1) continue;

    const name = part.slice(0, separator).trim();

    if (name === cookieName) {
      return part.slice(separator + 1).trim();
    }
  }

  return null;
}

function verifyAdminSession(req) {
  if (SESSION_SECRET.length < 32) {
    throw new Error('SESSION_CONFIGURATION_ERROR');
  }

  const token = getCookie(req, SESSION_COOKIE);

  if (!token) return false;

  const parts = token.split('.');

  if (parts.length !== 2) return false;

  const [encodedPayload, encodedSignature] = parts;

  if (!encodedPayload || !encodedSignature) return false;

  let suppliedSignature;
  let expectedSignature;

  try {
    suppliedSignature = Buffer.from(
      encodedSignature,
      'base64url'
    );

    expectedSignature = createHmac(
      'sha256',
      SESSION_SECRET
    )
      .update(encodedPayload)
      .digest();
  } catch {
    return false;
  }

  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return false;
  }

  let session;

  try {
    session = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    );
  } catch {
    return false;
  }

  if (
    !session ||
    typeof session.exp !== 'number' ||
    session.exp <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  // Accept only roles intended for administrators.
  // The login endpoint must issue one of these exact roles.
  return ['admin', 'owner'].includes(session.role);
}

function validateContact(contact, requireId = false) {
  if (!contact || typeof contact !== 'object' || Array.isArray(contact)) {
    return 'A valid contact object is required.';
  }

  if (
    !contact.name ||
    typeof contact.name !== 'object' ||
    typeof contact.name.displayName !== 'string' ||
    !contact.name.displayName.trim()
  ) {
    return 'Contact display name is required.';
  }

  if (contact.name.displayName.length > 255) {
    return 'Contact display name is too long.';
  }

  if (requireId && (
    typeof contact.id !== 'string' ||
    !contact.id.trim() ||
    contact.id.length > 64
  )) {
    return 'A valid contact ID is required.';
  }

  if (
    contact.id !== undefined &&
    (typeof contact.id !== 'string' || contact.id.length > 64)
  ) {
    return 'Invalid contact ID.';
  }

  if (
    contact.phones !== undefined &&
    !Array.isArray(contact.phones)
  ) {
    return 'Phones must be an array.';
  }

  if (
    contact.emails !== undefined &&
    !Array.isArray(contact.emails)
  ) {
    return 'Emails must be an array.';
  }

  if (contact.phones?.length > 20 || contact.emails?.length > 20) {
    return 'Too many phone numbers or email addresses.';
  }

  if (
    contact.notes !== undefined &&
    typeof contact.notes !== 'string'
  ) {
    return 'Notes must be text.';
  }

  if (typeof contact.notes === 'string' && contact.notes.length > 20000) {
    return 'Notes are too long.';
  }

  return null;
}

function makeContactId() {
  return 'c-' + Date.now().toString(36) + '-' +
    Math.random().toString(36).slice(2, 10);
}

async function fetchGitHubContacts() {
  if (!githubConfigured) {
    throw new Error('CONTACT_STORAGE_NOT_CONFIGURED');
  }

  const url =
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}` +
    `/contents/${FILE_PATH}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PFRE-Contact-Directory'
    }
  });

  if (response.status === 404) {
    return { data: [], sha: null };
  }

  if (!response.ok) {
    throw new Error('GITHUB_READ_FAILED');
  }

  const fileData = await response.json();

  if (typeof fileData.content !== 'string') {
    throw new Error('GITHUB_INVALID_CONTENT');
  }

  let content;

  try {
    content = JSON.parse(
      Buffer.from(fileData.content, 'base64').toString('utf8')
    );
  } catch {
    throw new Error('CONTACT_DATA_INVALID');
  }

  if (!Array.isArray(content)) {
    throw new Error('CONTACT_DATA_INVALID');
  }

  return {
    data: content,
    sha: fileData.sha
  };
}

async function commitGitHubContacts(contentArray, sha, message) {
  if (!githubConfigured) {
    throw new Error('CONTACT_STORAGE_NOT_CONFIGURED');
  }

  const url =
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}` +
    `/contents/${FILE_PATH}`;

  const contentBase64 = Buffer.from(
    JSON.stringify(contentArray, null, 2),
    'utf8'
  ).toString('base64');

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PFRE-Contact-Directory'
    },
    body: JSON.stringify({
      message,
      content: contentBase64,
      ...(sha ? { sha } : {})
    })
  });

  if (!response.ok) {
    // Do not report success when GitHub has rejected the write.
    throw new Error(
      response.status === 409 || response.status === 422
        ? 'GITHUB_CONFLICT'
        : 'GITHUB_WRITE_FAILED'
    );
  }

  return true;
}

async function ensureDatabase(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id VARCHAR(64) PRIMARY KEY,
      prefix VARCHAR(32),
      first_name VARCHAR(128) NOT NULL,
      last_name VARCHAR(128),
      display_name VARCHAR(255) NOT NULL,
      nickname VARCHAR(128),
      company VARCHAR(255),
      primary_phone VARCHAR(32) NOT NULL DEFAULT '',
      wa_phone VARCHAR(32),
      email VARCHAR(255),
      birthday DATE,
      anniversary DATE,
      contact_type VARCHAR(64) DEFAULT 'Buyer',
      budget_range VARCHAR(128),
      pan_number VARCHAR(32),
      address TEXT,
      city VARCHAR(128) DEFAULT 'Mumbai',
      notes TEXT,
      vip_starred BOOLEAN DEFAULT FALSE,
      raw_json JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_primary_phone
      ON contacts(primary_phone);

    CREATE INDEX IF NOT EXISTS idx_contacts_contact_type
      ON contacts(contact_type);
  `);
}

function formatDatabaseContact(row) {
  if (row.raw_json && Object.keys(row.raw_json).length > 0) {
    return row.raw_json;
  }

  return {
    id: row.id,
    name: {
      prefix: row.prefix || '',
      firstName: row.first_name,
      lastName: row.last_name || '',
      displayName: row.display_name,
      nickname: row.nickname || ''
    },
    organization: { company: row.company || '' },
    phones: [
      {
        type: 'Mobile',
        number: row.primary_phone,
        isPrimary: true
      },
      {
        type: 'WhatsApp',
        number: row.wa_phone || row.primary_phone
      }
    ],
    emails: row.email
      ? [{ type: 'Primary', address: row.email }]
      : [],
    dates: {
      birthday: row.birthday,
      anniversary: row.anniversary
    },
    addresses: [
      {
        type: 'Residence',
        street: row.address,
        city: row.city
      }
    ],
    rems: {
      contactType: row.contact_type,
      budgetRange: row.budget_range,
      panNumber: row.pan_number,
      vipStarred: row.vip_starred
    },
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getContactValues(contact, normalized) {
  const primaryPhone = contact.phones?.[0]?.number || '';
  const waPhone = contact.phones?.[1]?.number || primaryPhone;
  const email = contact.emails?.[0]?.address || null;

  return [
    normalized.id,
    contact.name?.prefix || null,
    contact.name?.firstName || contact.name.displayName,
    contact.name?.lastName || null,
    contact.name.displayName.trim(),
    contact.name?.nickname || null,
    contact.organization?.company || null,
    String(primaryPhone),
    String(waPhone),
    email,
    contact.dates?.birthday || null,
    contact.dates?.anniversary || null,
    contact.rems?.contactType || 'Buyer',
    contact.rems?.budgetRange || null,
    contact.rems?.panNumber || null,
    contact.addresses?.[0]?.street || null,
    contact.addresses?.[0]?.city || 'Mumbai',
    contact.notes || null,
    Boolean(contact.rems?.vipStarred),
    JSON.stringify(normalized),
    normalized.createdAt,
    normalized.updatedAt
  ];
}

async function saveDatabaseContact(client, contact, normalized) {
  const values = getContactValues(contact, normalized);

  await client.query(
    `
      INSERT INTO contacts (
        id, prefix, first_name, last_name, display_name, nickname,
        company, primary_phone, wa_phone, email, birthday, anniversary,
        contact_type, budget_range, pan_number, address, city, notes,
        vip_starred, raw_json, created_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,$21,$22,$23
      )
      ON CONFLICT (id) DO UPDATE SET
        prefix = EXCLUDED.prefix,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        display_name = EXCLUDED.display_name,
        nickname = EXCLUDED.nickname,
        company = EXCLUDED.company,
        primary_phone = EXCLUDED.primary_phone,
        wa_phone = EXCLUDED.wa_phone,
        email = EXCLUDED.email,
        birthday = EXCLUDED.birthday,
        anniversary = EXCLUDED.anniversary,
        contact_type = EXCLUDED.contact_type,
        budget_range = EXCLUDED.budget_range,
        pan_number = EXCLUDED.pan_number,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        notes = EXCLUDED.notes,
        vip_starred = EXCLUDED.vip_starred,
        raw_json = EXCLUDED.raw_json,
        updated_at = EXCLUDED.updated_at
    `,
    values
  );
}

function publicError(res, error) {
  const code = error?.message || '';

  console.error('Contacts API failure:', code || 'UNKNOWN_ERROR');

  if (code === 'SESSION_CONFIGURATION_ERROR') {
    return res.status(503).json({
      success: false,
      error: 'Authentication is not configured on the server.'
    });
  }

  if (code === 'CONTACT_STORAGE_NOT_CONFIGURED') {
    return res.status(503).json({
      success: false,
      error: 'Contact storage is not configured.'
    });
  }

  if (code === 'GITHUB_CONFLICT') {
    return res.status(409).json({
      success: false,
      error: 'Contact data changed concurrently. Please reload and retry.'
    });
  }

  return res.status(500).json({
    success: false,
    error: 'The contact operation failed. Check server logs.'
  });
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (!checkOrigin(req, res)) return;

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');

    return res.status(405).json({
      success: false,
      error: 'Method not allowed.'
    });
  }

  // Every operation, including GET, requires a valid admin session.
  // Never fall back to a shared password or a client-supplied secret.
  let authenticated;

  try {
    authenticated = verifyAdminSession(req);
  } catch (error) {
    return publicError(res, error);
  }

  if (!authenticated) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in again.'
    });
  }

  let client;

  try {
    if (pool) {
      try {
        client = await pool.connect();
        await ensureDatabase(client);
      } catch (dbError) {
        console.error('Contact database unavailable.');
        if (client) client.release();
        client = null;
      }
    }

    if (!client && !githubConfigured) {
      throw new Error('CONTACT_STORAGE_NOT_CONFIGURED');
    }

    if (req.method === 'GET') {
      if (client) {
        const result = await client.query(
          'SELECT * FROM contacts ORDER BY display_name ASC'
        );

        if (result.rows.length > 0) {
          return res.status(200).json({
            success: true,
            contacts: result.rows.map(formatDatabaseContact)
          });
        }
      }

      const { data } = await fetchGitHubContacts();

      return res.status(200).json({
        success: true,
        contacts: data
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const contact = req.body?.contact;
      const validationError = validateContact(
        contact,
        req.method === 'PUT'
      );

      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError
        });
      }

      const now = new Date().toISOString();

      const normalized = {
        ...contact,
        id: contact.id || makeContactId(),
        createdAt: contact.createdAt || now,
        updatedAt: now
      };

      if (client) {
        await saveDatabaseContact(client, contact, normalized);
      }

      // Use GitHub as the writable store when PostgreSQL is unavailable.
      // If both are configured, retain the existing dual-write behaviour.
      if (githubConfigured) {
        const { data: currentList, sha } = await fetchGitHubContacts();

        const filtered = currentList.filter(
          item => item.id !== normalized.id
        );

        filtered.unshift(normalized);

        const action = req.method === 'POST' ? 'add' : 'update';

        await commitGitHubContacts(
          filtered,
          sha,
          `contacts: ${action} ${normalized.id}`
        );
      } else if (!client) {
        throw new Error('CONTACT_STORAGE_NOT_CONFIGURED');
      }

      return res.status(req.method === 'POST' ? 201 : 200).json({
        success: true,
        contact: normalized
      });
    }

    if (req.method === 'DELETE') {
      const id = req.body?.id;

      if (
        typeof id !== 'string' ||
        !id.trim() ||
        id.length > 64
      ) {
        return res.status(400).json({
          success: false,
          error: 'A valid contact ID is required.'
        });
      }

      if (client) {
        await client.query(
          'DELETE FROM contacts WHERE id = $1',
          [id]
        );
      }

      if (githubConfigured) {
        const { data: currentList, sha } = await fetchGitHubContacts();
        const filtered = currentList.filter(item => item.id !== id);

        await commitGitHubContacts(
          filtered,
          sha,
          `contacts: delete ${id}`
        );
      } else if (!client) {
        throw new Error('CONTACT_STORAGE_NOT_CONFIGURED');
      }

      return res.status(200).json({
        success: true,
        message: 'Contact deleted successfully.'
      });
    }
  } catch (error) {
    return publicError(res, error);
  } finally {
    if (client) client.release();
  }
}