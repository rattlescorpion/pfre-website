
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Pool } from 'pg';

const COOKIE_NAME = '__Host-pfre_session';
const ALLOWED_ROLES = new Set(['owner', 'admin', 'super_admin']);

let pool;

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable'
      ? false
      : { rejectUnauthorized: true },
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
  });
}

function respond(res, status, data) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(data);
}

function getCookie(req, name) {
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 1) continue;

    if (part.slice(0, i).trim() === name) {
      return part.slice(i + 1).trim();
    }
  }

  return '';
}

function verifySession(req) {
  const secret = process.env.SESSION_SECRET;
  const token = getCookie(req, COOKIE_NAME);

  if (!secret || secret.length < 32 || !token || token.length > 4096) {
    return false;
  }

  const separator = token.lastIndexOf('.');
  if (separator < 1 || separator === token.length - 1) return false;

  const payloadPart = token.slice(0, separator);
  const supplied = Buffer.from(token.slice(separator + 1));
  const expected = Buffer.from(
    createHmac('sha256', secret)
      .update(payloadPart)
      .digest('base64url')
  );

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadPart, 'base64url').toString('utf8')
    );

    return Boolean(
      payload &&
      typeof payload.email === 'string' &&
      ALLOWED_ROLES.has(payload.role) &&
      Number.isInteger(payload.exp) &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;

  try {
    const parsed = new URL(origin);
    const host = String(
      req.headers['x-forwarded-host'] || req.headers.host || ''
    ).split(',')[0].trim().toLowerCase();

    return parsed.protocol === 'https:' &&
      Boolean(host) &&
      parsed.host.toLowerCase() === host;
  } catch {
    return false;
  }
}

function getProjectId(req) {
  const id = typeof req.query?.projectId === 'string'
    ? req.query.projectId
    : '';

  return /^prj-[A-Za-z0-9-]{10,80}$/.test(id) ? id : '';
}

function getRecordId(req) {
  const id = typeof req.query?.id === 'string'
    ? req.query.id
    : '';

  return /^[1-9][0-9]{0,18}$/.test(id) ? id : '';
}

function textValue(value, field, max, required = false) {
  if (value === undefined && !required) return undefined;

  if (typeof value !== 'string') {
    throw new Error(`${field} must be text.`);
  }

  const cleaned = value.trim();

  if (required && !cleaned) {
    throw new Error(`${field} is required.`);
  }

  if (cleaned.length > max) {
    throw new Error(`${field} is too long.`);
  }

  return cleaned || (required ? '' : null);
}

function validateReference(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('A land-reference object is required.');
  }

  const result = {};

  if (!partial || 'referenceType' in input) {
    result.reference_type = textValue(
      input.referenceType,
      'referenceType',
      50,
      true
    );
  }

  if (!partial || 'referenceNumber' in input) {
    result.reference_number = textValue(
      input.referenceNumber,
      'referenceNumber',
      150,
      true
    );
  }

  if (!partial || 'notes' in input) {
    result.notes = textValue(
      input.notes === undefined && !partial ? '' : input.notes,
      'notes',
      2000
    );
  }

  const allowedTypes = new Set([
    'survey_number',
    'hissa_number',
    'cts_number',
    'plot_number',
    'gat_number',
    'city_survey_number',
    'other'
  ]);

  if (
    result.reference_type !== undefined &&
    result.reference_type !== null &&
    !allowedTypes.has(result.reference_type)
  ) {
    throw new Error(
      'Reference type must be survey_number, hissa_number, cts_number, plot_number, gat_number, city_survey_number, or other.'
    );
  }

  return result;
}

function toShape(row) {
  return {
    id: String(row.id),
    projectId: row.project_id,
    referenceType: row.reference_type,
    referenceNumber: row.reference_number,
    notes: row.notes,
    createdAt: row.created_at
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PATCH');
    return respond(res, 405, {
      success: false,
      message: 'Method not allowed.'
    });
  }

  if (!verifySession(req)) {
    return respond(res, 401, {
      success: false,
      message: 'Sign in with an authorised PFRE account.'
    });
  }

  if (req.method !== 'GET' && !sameOrigin(req)) {
    return respond(res, 403, {
      success: false,
      message: 'Cross-origin requests are not allowed.'
    });
  }

  if (!pool) {
    return respond(res, 503, {
      success: false,
      message: 'PostgreSQL is not configured.'
    });
  }

  const projectId = getProjectId(req);

  if (!projectId) {
    return respond(res, 400, {
      success: false,
      message: 'A valid projectId query parameter is required.'
    });
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        `SELECT *
         FROM project_land_references
         WHERE project_id = $1
         ORDER BY reference_type ASC, reference_number ASC
         LIMIT 500`,
        [projectId]
      );

      return respond(res, 200, {
        success: true,
        count: result.rows.length,
        landReferences: result.rows.map(toShape)
      });
    }

    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return respond(res, 400, {
          success: false,
          message: 'Request body must be valid JSON.'
        });
      }
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return respond(res, 400, {
        success: false,
        message: 'Request body must be a JSON object.'
      });
    }

    if (req.method === 'POST') {
      const reference = validateReference(body.reference, false);
      const columns = Object.keys(reference);
      const values = Object.values(reference);
      const placeholders = values.map((_, i) => `$${i + 1}`);

      const result = await pool.query(
        `INSERT INTO project_land_references
          (project_id, ${columns.join(', ')})
         VALUES
          ($${values.length + 1}, ${placeholders.join(', ')})
         RETURNING *`,
        [...values, projectId]
      );

      return respond(res, 201, {
        success: true,
        message: 'Land reference added.',
        landReference: toShape(result.rows[0])
      });
    }

    const recordId = getRecordId(req);

    if (!recordId) {
      return respond(res, 400, {
        success: false,
        message: 'A valid land-reference ID is required in the URL.'
      });
    }

    const reference = validateReference(body.reference, true);
    const columns = Object.keys(reference);

    if (!columns.length) {
      return respond(res, 400, {
        success: false,
        message: 'Provide at least one field to update.'
      });
    }

    const values = Object.values(reference);
    const assignments = columns.map(
      (column, i) => `${column} = $${i + 1}`
    );

    values.push(recordId, projectId);

    const result = await pool.query(
      `UPDATE project_land_references
       SET ${assignments.join(', ')}
       WHERE id = $${values.length - 1}
         AND project_id = $${values.length}
       RETURNING *`,
      values
    );

    if (!result.rowCount) {
      return respond(res, 404, {
        success: false,
        message: 'Land reference not found under this project.'
      });
    }

    return respond(res, 200, {
      success: true,
      message: 'Land reference updated.',
      landReference: toShape(result.rows[0])
    });
  } catch (error) {
    if (
      error instanceof Error &&
      /required|must be|invalid|too long|provide at least/i.test(
        error.message
      )
    ) {
      return respond(res, 400, {
        success: false,
        message: error.message
      });
    }

    console.error(
      'Project land-reference API error:',
      error?.message || 'Unknown error'
    );

    return respond(res, 500, {
      success: false,
      message: 'Land-reference operation failed. Check server logs.'
    });
  }
}
