
import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
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

function projectIdFromRequest(req) {
  const id = typeof req.query?.projectId === 'string'
    ? req.query.projectId
    : '';

  return /^prj-[A-Za-z0-9-]{10,80}$/.test(id) ? id : '';
}

function textField(value, name, max, required = false) {
  if (value === undefined && !required) return undefined;

  if (typeof value !== 'string') {
    throw new Error(`${name} must be text.`);
  }

  const cleaned = value.trim();

  if (required && !cleaned) {
    throw new Error(`${name} is required.`);
  }

  if (cleaned.length > max) {
    throw new Error(`${name} is too long.`);
  }

  return cleaned || (required ? '' : null);
}

function numberField(value, name, min, max, integer = false) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const n = Number(value);

  if (
    !Number.isFinite(n) ||
    n < min ||
    n > max ||
    (integer && !Number.isInteger(n))
  ) {
    throw new Error(`${name} is invalid.`);
  }

  return n;
}

function validateConfiguration(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('A configuration object is required.');
  }

  const result = {};

  const textFields = [
    ['configuration_name', 'configurationName', 150],
    ['property_type', 'propertyType', 50]
  ];

  for (const [column, key, max] of textFields) {
    if (partial && !(key in input)) continue;

    result[column] = textField(
      input[key],
      key,
      max,
      !partial
    );
  }

  const numberFields = [
    ['bhk', 'bhk', 0, 20, true],
    ['carpet_area', 'carpetArea', 0, 1000000000, false],
    ['built_up_area', 'builtUpArea', 0, 1000000000, false],
    ['super_built_up_area', 'superBuiltUpArea', 0, 1000000000, false],
    ['rera_carpet_area', 'reraCarpetArea', 0, 1000000000, false],
    ['mofa_carpet_area', 'mofaCarpetArea', 0, 1000000000, false],
    ['usable_carpet_area', 'usableCarpetArea', 0, 1000000000, false],
    ['bathrooms', 'bathrooms', 0, 100, true],
    ['balconies', 'balconies', 0, 100, true]
  ];

  for (const [column, key, min, max, integer] of numberFields) {
    if (partial && !(key in input)) continue;
    result[column] = numberField(input[key], key, min, max, integer);
  }

  if (!partial || 'areaUnit' in input) {
    const unit = input.areaUnit === undefined && !partial
      ? 'sq ft'
      : input.areaUnit;

    result.area_unit = textField(unit, 'areaUnit', 20, true);
  }

  if (!partial || 'notes' in input) {
    result.notes = textField(
      input.notes === undefined && !partial ? '' : input.notes,
      'notes',
      5000
    );
  }

  if (!partial || 'isActive' in input) {
    const active = input.isActive === undefined && !partial
      ? true
      : input.isActive;

    if (typeof active !== 'boolean') {
      throw new Error('isActive must be true or false.');
    }

    result.is_active = active;
  }

  return result;
}

function toShape(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    configurationName: row.configuration_name,
    propertyType: row.property_type,
    bhk: row.bhk,
    carpetArea: row.carpet_area,
    builtUpArea: row.built_up_area,
    superBuiltUpArea: row.super_built_up_area,
    reraCarpetArea: row.rera_carpet_area,
    mofaCarpetArea: row.mofa_carpet_area,
    usableCarpetArea: row.usable_carpet_area,
    areaUnit: row.area_unit,
    bathrooms: row.bathrooms,
    balconies: row.balconies,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
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

  const projectId = projectIdFromRequest(req);

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
         FROM project_configurations
         WHERE project_id = $1
         ORDER BY is_active DESC, configuration_name ASC
         LIMIT 500`,
        [projectId]
      );

      return respond(res, 200, {
        success: true,
        count: result.rows.length,
        configurations: result.rows.map(toShape)
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
      const config = validateConfiguration(body.configuration, false);
      const id = `cfg-${randomUUID()}`;
      const columns = Object.keys(config);
      const values = Object.values(config);
      const placeholders = values.map((_, i) => `$${i + 1}`);

      const result = await pool.query(
        `INSERT INTO project_configurations
          (id, project_id, ${columns.join(', ')})
         VALUES
          ($${values.length + 1}, $${values.length + 2},
           ${placeholders.join(', ')})
         RETURNING *`,
        [...values, id, projectId]
      );

      return respond(res, 201, {
        success: true,
        message: 'Project configuration created.',
        configuration: toShape(result.rows[0])
      });
    }

    const configId = typeof req.query?.id === 'string'
      ? req.query.id
      : '';

    if (!/^cfg-[A-Za-z0-9-]{10,80}$/.test(configId)) {
      return respond(res, 400, {
        success: false,
        message: 'A valid configuration ID is required in the URL.'
      });
    }

    const config = validateConfiguration(body.configuration, true);
    const columns = Object.keys(config);

    if (!columns.length) {
      return respond(res, 400, {
        success: false,
        message: 'Provide at least one configuration field to update.'
      });
    }

    const values = Object.values(config);
    const assignments = columns.map(
      (column, i) => `${column} = $${i + 1}`
    );

    values.push(configId, projectId);

    const result = await pool.query(
      `UPDATE project_configurations
       SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length - 1}
         AND project_id = $${values.length}
       RETURNING *`,
      values
    );

    if (!result.rowCount) {
      return respond(res, 404, {
        success: false,
        message: 'Configuration not found under this project.'
      });
    }

    return respond(res, 200, {
      success: true,
      message: 'Project configuration updated.',
      configuration: toShape(result.rows[0])
    });
  } catch (error) {
    if (
      error instanceof Error &&
      /required|must be|invalid|too long|provide at least/i.test(error.message)
    ) {
      return respond(res, 400, {
        success: false,
        message: error.message
      });
    }

    console.error(
      'Project configuration API error:',
      error?.message || 'Unknown error'
    );

    return respond(res, 500, {
      success: false,
      message: 'Configuration operation failed. Check server logs.'
    });
  }
}
