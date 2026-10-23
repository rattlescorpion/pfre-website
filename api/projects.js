
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
  const token = getCookie(req, COOKIE_NAME);

  if (!secret || secret.length < 32 || !token || token.length > 4096) {
    return null;
  }

  const separator = token.lastIndexOf('.');
  if (separator < 1 || separator === token.length - 1) return null;

  const payloadPart = token.slice(0, separator);
  const signature = Buffer.from(token.slice(separator + 1));
  const expected = Buffer.from(
    createHmac('sha256', secret)
      .update(payloadPart)
      .digest('base64url')
  );

  if (
    signature.length !== expected.length ||
    !timingSafeEqual(signature, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadPart, 'base64url').toString('utf8')
    );

    if (
      !payload ||
      typeof payload.email !== 'string' ||
      !ALLOWED_ROLES.has(payload.role) ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
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

function requiredText(value, field, max = 255) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  if (value.trim().length > max) {
    throw new Error(`${field} is too long.`);
  }
  return value.trim();
}

function optionalText(value, field, max = 255) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) {
    throw new Error(`${field} is invalid or too long.`);
  }
  return value.trim() || null;
}

function optionalNumber(value, field, min, max) {
  if (value === undefined || value === null || value === '') return null;

  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${field} must be a valid number.`);
  }
  return number;
}

function validateProject(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('A project object is required.');
  }

  const result = {};

  const fields = {
    name: ['name', 255],
    developer_name: ['developerName', 255],
    project_status: ['projectStatus', 32],
    project_rera_id: ['projectReraId', 100],
    society_name: ['societyName', 255],
    default_building_name: ['defaultBuildingName', 255],
    road: ['road', 255],
    locality: ['locality', 128],
    area_name: ['areaName', 128],
    city: ['city', 128],
    district: ['district', 128],
    state: ['state', 128],
    country: ['country', 128],
    police_station: ['policeStation', 255],
    post_office: ['postOffice', 255],
    postal_code: ['postalCode', 20],
    landmark: ['landmark', 1000],
    full_address: ['fullAddress', 2000],
    description: ['description', 10000],
    notes: ['notes', 10000]
  };

  for (const [column, [key, max]] of Object.entries(fields)) {
    if (partial && !(key in input)) continue;

    if (key === 'name') {
      result[column] = requiredText(input[key], 'Project name', max);
    } else {
      result[column] = optionalText(input[key], key, max);
    }
  }

  // Database-required defaults for new projects.
  if (!partial) {
    result.project_status = result.project_status || 'unknown';
    result.city = result.city || 'Mumbai';
    result.state = result.state || 'Maharashtra';
    result.country = result.country || 'India';
  }

  // These database columns cannot be blank during an update.
  if (partial) {
    for (const [column, key] of [
      ['project_status', 'projectStatus'],
      ['city', 'city'],
      ['state', 'state'],
      ['country', 'country']
    ]) {
      if (key in input && result[column] === null) {
        throw new Error(`${key} cannot be blank.`);
      }
    }
  }

  if (!partial || 'projectType' in input) {
    const type = input.projectType;
    if (!['residential', 'commercial', 'mixed'].includes(type)) {
      throw new Error(
        'Project type must be residential, commercial, or mixed.'
      );
    }
    result.project_type = type;
  }

  if (!partial || 'propertyTypes' in input) {
    const types = input.propertyTypes ?? [];
    if (
      !Array.isArray(types) ||
      types.length > 30 ||
      types.some((v) =>
        typeof v !== 'string' || !v.trim() || v.length > 50
      )
    ) {
      throw new Error('Property types must be a valid list.');
    }
    result.property_types = [...new Set(types.map((v) => v.trim()))];
  }

  if (!partial || 'societyFormed' in input) {
    if (
      input.societyFormed !== undefined &&
      typeof input.societyFormed !== 'boolean'
    ) {
      throw new Error('Society formed must be true or false.');
    }
    result.society_formed = input.societyFormed === true;
  }

  for (const [column, key, min, max] of [
    ['land_area', 'landArea', 0, 100000000000],
    ['latitude', 'latitude', -90, 90],
    ['longitude', 'longitude', -180, 180]
  ]) {
    if (!partial || key in input) {
      result[column] = optionalNumber(input[key], key, min, max);
    }
  }

  if (!partial || 'landAreaUnit' in input) {
    result.land_area_unit = optionalText(input.landAreaUnit, 'landAreaUnit', 20);
  }

  return result;
}

function toPublicShape(row) {
  return {
    id: row.id,
    name: row.name,
    projectType: row.project_type,
    propertyTypes: row.property_types || [],
    developerName: row.developer_name,
    projectStatus: row.project_status,
    projectReraId: row.project_rera_id,
    societyFormed: row.society_formed,
    societyName: row.society_name,
    defaultBuildingName: row.default_building_name,
    road: row.road,
    locality: row.locality,
    areaName: row.area_name,
    city: row.city,
    district: row.district,
    state: row.state,
    country: row.country,
    policeStation: row.police_station,
    postOffice: row.post_office,
    postalCode: row.postal_code,
    landmark: row.landmark,
    fullAddress: row.full_address,
    latitude: row.latitude,
    longitude: row.longitude,
    landArea: row.land_area,
    landAreaUnit: row.land_area_unit,
    description: row.description,
    notes: row.notes,
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

  const session = verifySession(req);
  if (!session) {
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

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT *
        FROM projects
        ORDER BY updated_at DESC, name ASC
        LIMIT 500
      `);

      return respond(res, 200, {
        success: true,
        count: result.rows.length,
        projects: result.rows.map(toPublicShape)
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
      const project = validateProject(body.project, false);
      const id = `prj-${randomUUID()}`;
      const columns = Object.keys(project);
      const values = Object.values(project);
      const placeholders = values.map((_, i) => `$${i + 1}`);

      const result = await pool.query(
        `INSERT INTO projects (id, ${columns.join(', ')})
         VALUES ($${values.length + 1}, ${placeholders.join(', ')})
         RETURNING *`,
        [...values, id]
      );

      return respond(res, 201, {
        success: true,
        message: 'Project created.',
        project: toPublicShape(result.rows[0])
      });
    }

    const id = typeof req.query?.id === 'string' ? req.query.id : '';
    if (!/^prj-[A-Za-z0-9-]{10,80}$/.test(id)) {
      return respond(res, 400, {
        success: false,
        message: 'A valid project ID is required in the URL.'
      });
    }

    const project = validateProject(body.project, true);
    const columns = Object.keys(project);

    if (!columns.length) {
      return respond(res, 400, {
        success: false,
        message: 'Provide at least one project field to update.'
      });
    }

    const values = Object.values(project);
    const assignments = columns.map(
      (column, i) => `${column} = $${i + 1}`
    );
    values.push(id);

    const result = await pool.query(
      `UPDATE projects
       SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (!result.rowCount) {
      return respond(res, 404, {
        success: false,
        message: 'Project not found.'
      });
    }

    return respond(res, 200, {
      success: true,
      message: 'Project updated. Individual property details were not changed.',
      project: toPublicShape(result.rows[0])
    });
  } catch (error) {
    if (error instanceof Error && /required|must be|invalid|too long|valid list/i.test(error.message)) {
      return respond(res, 400, {
        success: false,
        message: error.message
      });
    }

    console.error('Project API error:', error?.message || 'Unknown error');
    return respond(res, 500, {
      success: false,
      message: 'Project operation failed. Check the server logs.'
    });
  }
}
