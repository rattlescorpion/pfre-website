
/**
 * api/post-project.js
 * Property Finder Real Estate - Mumbai
 *
 * Public: GET project listings.
 * Admin only: POST, PUT, DELETE.
 *
 * Required for write operations:
 *   SESSION_SECRET (minimum 32 characters)
 *
 * Storage:
 *   POSTGRES_URL or DATABASE_URL
 *   and/or GITHUB_TOKEN, REPO_OWNER, REPO_NAME
 */

import { Pool } from 'pg';
import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = '__Host-pfre_session';
const FILE_PATH = 'data/projects.json';

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

const allowedOrigins = new Set([
  'https://www.propertyfinderrealestate.com',
  'https://propertyfinderrealestate.com',
  'https://pfre-website.vercel.app',
  ...(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
]);

function setSecurityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Origin');
}

function checkOrigin(req, res) {
  const origin = req.headers.origin;

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  return true;
}

function getCookie(req, cookieName) {
  const cookieHeader = req.headers.cookie || '';

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;

    if (part.slice(0, separator).trim() === cookieName) {
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

  try {
    suppliedSignature = Buffer.from(
      encodedSignature,
      'base64url'
    );
  } catch {
    return false;
  }

  const expectedSignature = createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest();

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

  return ['admin', 'owner'].includes(session.role);
}

function validateProject(project, requireId = false) {
  if (
    !project ||
    typeof project !== 'object' ||
    Array.isArray(project)
  ) {
    return 'A valid project object is required.';
  }

  const requiredFields = ['title', 'developer', 'location'];

  for (const field of requiredFields) {
    if (
      typeof project[field] !== 'string' ||
      !project[field].trim()
    ) {
      return `${field} is required.`;
    }
  }

  const limits = {
    title: 255,
    developer: 255,
    location: 255,
    slug: 255,
    type: 64,
    description: 20000,
    config: 128,
    priceRange: 128,
    carpetArea: 128,
    reraId: 64,
    possession: 64,
    status: 64
  };

  for (const [field, max] of Object.entries(limits)) {
    if (
      project[field] !== undefined &&
      (typeof project[field] !== 'string' ||
        project[field].length > max)
    ) {
      return `Invalid ${field}: maximum length is ${max}.`;
    }
  }

  if (
    requireId &&
    (typeof project.id !== 'string' ||
      !project.id.trim() ||
      project.id.length > 64)
  ) {
    return 'A valid project ID is required.';
  }

  if (
    project.id !== undefined &&
    (typeof project.id !== 'string' || project.id.length > 64)
  ) {
    return 'Invalid project ID.';
  }

  if (
    project.category !== undefined &&
    !['launch', 'uc', 'ready'].includes(project.category)
  ) {
    return 'Invalid project category.';
  }

  if (
    project.images !== undefined &&
    (!Array.isArray(project.images) ||
      project.images.length > 30 ||
      project.images.some(
        image => typeof image !== 'string' || image.length > 2048
      ))
  ) {
    return 'Images must be an array of up to 30 text URLs or paths.';
  }

  if (
    project.amenities !== undefined &&
    (!Array.isArray(project.amenities) ||
      project.amenities.length > 100 ||
      project.amenities.some(
        item => typeof item !== 'string' || item.length > 200
      ))
  ) {
    return 'Amenities must be an array of up to 100 text items.';
  }

  if (
    project.featured !== undefined &&
    typeof project.featured !== 'boolean'
  ) {
    return 'Featured must be true or false.';
  }

  return null;
}

function makeProjectId(slug) {
  return `proj-${slug}-${Date.now().toString(36)}`;
}

async function fetchGitHubProjects() {
  if (!githubConfigured) {
    throw new Error('PROJECT_STORAGE_NOT_CONFIGURED');
  }

  const url =
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}` +
    `/contents/${FILE_PATH}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PFRE-Project-Engine'
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
    throw new Error('PROJECT_DATA_INVALID');
  }

  if (!Array.isArray(content)) {
    throw new Error('PROJECT_DATA_INVALID');
  }

  return { data: content, sha: fileData.sha };
}

async function commitGitHubProjects(contentArray, sha, message) {
  if (!githubConfigured) {
    throw new Error('PROJECT_STORAGE_NOT_CONFIGURED');
  }

  const url =
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}` +
    `/contents/${FILE_PATH}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PFRE-Project-Engine'
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(
        JSON.stringify(contentArray, null, 2),
        'utf8'
      ).toString('base64'),
      ...(sha ? { sha } : {})
    })
  });

  if (!response.ok) {
    throw new Error(
      response.status === 409 || response.status === 422
        ? 'GITHUB_CONFLICT'
        : 'GITHUB_WRITE_FAILED'
    );
  }
}

async function ensureDatabase(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      developer VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      category VARCHAR(32) NOT NULL,
      type VARCHAR(64) DEFAULT 'Residential',
      description TEXT,
      config VARCHAR(128),
      price_range VARCHAR(128),
      carpet_area VARCHAR(128),
      rera_id VARCHAR(64),
      possession VARCHAR(64),
      status VARCHAR(64) DEFAULT 'Active',
      featured BOOLEAN DEFAULT FALSE,
      images JSONB DEFAULT '[]'::jsonb,
      amenities JSONB DEFAULT '[]'::jsonb,
      raw_json JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_projects_category
      ON projects(category);

    CREATE INDEX IF NOT EXISTS idx_projects_location
      ON projects(location);
  `);
}

function formatDatabaseProject(row) {
  if (row.raw_json && Object.keys(row.raw_json).length > 0) {
    return row.raw_json;
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    developer: row.developer,
    location: row.location,
    category: row.category,
    type: row.type,
    description: row.description,
    config: row.config,
    priceRange: row.price_range,
    carpetArea: row.carpet_area,
    reraId: row.rera_id,
    possession: row.possession,
    status: row.status,
    featured: row.featured,
    images: row.images,
    amenities: row.amenities,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function saveDatabaseProject(client, project) {
  await client.query(
    `
      INSERT INTO projects (
        id, title, slug, developer, location, category, type,
        description, config, price_range, carpet_area, rera_id,
        possession, status, featured, images, amenities, raw_json,
        created_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
        $15,$16,$17,$18,$19,$20
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        developer = EXCLUDED.developer,
        location = EXCLUDED.location,
        category = EXCLUDED.category,
        type = EXCLUDED.type,
        description = EXCLUDED.description,
        config = EXCLUDED.config,
        price_range = EXCLUDED.price_range,
        carpet_area = EXCLUDED.carpet_area,
        rera_id = EXCLUDED.rera_id,
        possession = EXCLUDED.possession,
        status = EXCLUDED.status,
        featured = EXCLUDED.featured,
        images = EXCLUDED.images,
        amenities = EXCLUDED.amenities,
        raw_json = EXCLUDED.raw_json,
        updated_at = EXCLUDED.updated_at
    `,
    [
      project.id,
      project.title,
      project.slug,
      project.developer,
      project.location,
      project.category,
      project.type,
      project.description,
      project.config,
      project.priceRange,
      project.carpetArea,
      project.reraId,
      project.possession,
      project.status,
      project.featured,
      JSON.stringify(project.images),
      JSON.stringify(project.amenities),
      JSON.stringify(project),
      project.createdAt,
      project.updatedAt
    ]
  );
}

function sendError(res, error) {
  const code = error?.message || 'UNKNOWN_ERROR';

  // Log a short internal code, not database or secret-bearing details.
  console.error('Projects API failure:', code);

  if (code === 'SESSION_CONFIGURATION_ERROR') {
    return res.status(503).json({
      success: false,
      error: 'Admin authentication is not configured.'
    });
  }

  if (code === 'PROJECT_STORAGE_NOT_CONFIGURED') {
    return res.status(503).json({
      success: false,
      error: 'Project storage is not configured.'
    });
  }

  if (code === 'GITHUB_CONFLICT') {
    return res.status(409).json({
      success: false,
      error: 'Project data changed concurrently. Reload and retry.'
    });
  }

  return res.status(500).json({
    success: false,
    error: 'The project operation failed. Check server logs.'
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

  // Public project listings; mutations require an authenticated admin.
  if (req.method !== 'GET') {
    let authenticated;

    try {
      authenticated = verifyAdminSession(req);
    } catch (error) {
      return sendError(res, error);
    }

    if (!authenticated) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in again.'
      });
    }
  }

  let client;

  try {
    if (pool) {
      try {
        client = await pool.connect();
        await ensureDatabase(client);
      } catch {
        console.error('Project database unavailable.');

        if (client) client.release();
        client = null;
      }
    }

    if (!client && !githubConfigured) {
      throw new Error('PROJECT_STORAGE_NOT_CONFIGURED');
    }

    if (req.method === 'GET') {
      if (client) {
        const result = await client.query(
          'SELECT * FROM projects ORDER BY created_at DESC'
        );

        if (result.rows.length > 0) {
          return res.status(200).json({
            success: true,
            projects: result.rows.map(formatDatabaseProject)
          });
        }
      }

      const { data } = await fetchGitHubProjects();

      return res.status(200).json({
        success: true,
        projects: data
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const project = req.body?.project;

      const validationError = validateProject(
        project,
        req.method === 'PUT'
      );

      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError
        });
      }

      const now = new Date().toISOString();

      const slug = (project.slug || project.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 255);

      const normalized = {
        ...project,
        id: project.id || makeProjectId(slug),
        title: project.title.trim(),
        slug,
        developer: project.developer.trim(),
        location: project.location.trim(),
        category: project.category || 'launch',
        type: project.type || 'Residential',
        description: (project.description || '').trim(),
        config: project.config || '2, 3 BHK',
        priceRange: project.priceRange || 'Price on Request',
        carpetArea: project.carpetArea || 'Contact for Area',
        reraId: project.reraId || 'MahaRERA Registered',
        possession: project.possession || 'December 2027',
        status: project.status || 'Active Work',
        featured: Boolean(project.featured),
        images: project.images?.length
          ? project.images
          : ['/images/og-banner.jpg'],
        amenities: project.amenities?.length
          ? project.amenities
          : ['Clubhouse', 'Gymnasium', 'Swimming Pool', 'Podium Parking'],
        createdAt: project.createdAt || now,
        updatedAt: now
      };

      if (client) {
        await saveDatabaseProject(client, normalized);
      }

      if (githubConfigured) {
        const { data, sha } = await fetchGitHubProjects();
        const filtered = data.filter(item => item.id !== normalized.id);

        filtered.unshift(normalized);

        await commitGitHubProjects(
          filtered,
          sha,
          `projects: ${req.method === 'POST' ? 'publish' : 'update'} ${normalized.id}`
        );
      } else if (!client) {
        throw new Error('PROJECT_STORAGE_NOT_CONFIGURED');
      }

      return res.status(req.method === 'POST' ? 201 : 200).json({
        success: true,
        message: req.method === 'POST'
          ? 'Project published successfully.'
          : 'Project updated successfully.',
        project: normalized
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
          error: 'A valid project ID is required.'
        });
      }

      if (client) {
        await client.query(
          'DELETE FROM projects WHERE id = $1',
          [id]
        );
      }

      if (githubConfigured) {
        const { data, sha } = await fetchGitHubProjects();
        const filtered = data.filter(item => item.id !== id);

        await commitGitHubProjects(
          filtered,
          sha,
          `projects: delete ${id}`
        );
      } else if (!client) {
        throw new Error('PROJECT_STORAGE_NOT_CONFIGURED');
      }

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully.'
      });
    }
  } catch (error) {
    return sendError(res, error);
  } finally {
    if (client) client.release();
  }
}