/**
 * api/post-project.js
 * Property Finder Real Estate - Mumbai
 * Vercel Serverless Function to publish and manage real estate projects
 */

import { Pool } from 'pg';

let pool;
if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const FILE_PATH = 'data/projects.json';
const EXPECTED_PASSWORD = process.env.ADMIN_PASSWORD || 'pfre2026';

async function fetchGitHubProjects() {
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    return { data: [], sha: null };
  }
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'PFRE-Project-Engine'
    }
  });

  if (response.status === 404) {
    return { data: [], sha: null };
  }
  if (!response.ok) {
    throw new Error(`GitHub fetch failed with status ${response.status}`);
  }

  const fileData = await response.json();
  const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
  return {
    data: Array.isArray(content) ? content : [],
    sha: fileData.sha
  };
}

async function commitGitHubProjects(contentArray, sha, message) {
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) return false;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const contentBase64 = Buffer.from(JSON.stringify(contentArray, null, 2), 'utf8').toString('base64');
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'PFRE-Project-Engine'
    },
    body: JSON.stringify({
      message,
      content: contentBase64,
      ...(sha ? { sha } : {})
    })
  });

  return response.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const bodySecret = req.body?.adminPassword;

    if ((bearerToken || bodySecret) !== EXPECTED_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid admin security credentials.'
      });
    }
  }

  let client;
  if (pool) {
    try {
      client = await pool.connect();
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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
        CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);
      `);
    } catch (dbInitErr) {
      console.error('Postgres init warning:', dbInitErr.message);
    }
  }

  try {
    if (req.method === 'GET') {
      if (client) {
        const result = await client.query('SELECT * FROM projects ORDER BY created_at DESC');
        if (result.rows.length > 0) {
          const list = result.rows.map(row => {
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
          });
          return res.status(200).json({ success: true, projects: list });
        }
      }

      const { data } = await fetchGitHubProjects();
      return res.status(200).json({ success: true, projects: data });
    }

    if (req.method === 'POST') {
      const project = req.body?.project;
      if (!project || !project.title || !project.developer || !project.location) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request: title, developer, and location are required fields.'
        });
      }

      const slug = (project.slug || project.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const projectId = project.id || `proj-${slug}-${Date.now().toString(36)}`;
      const now = new Date().toISOString();

      const normalized = {
        id: projectId,
        title: project.title.trim(),
        slug: slug,
        developer: project.developer.trim(),
        location: project.location.trim(),
        category: ['launch', 'uc', 'ready'].includes(project.category) ? project.category : 'launch',
        type: project.type || 'Residential',
        description: project.description ? project.description.trim() : '',
        config: project.config || '2, 3 BHK',
        priceRange: project.priceRange || 'Price on Request',
        carpetArea: project.carpetArea || 'Contact for Area',
        reraId: project.reraId ? project.reraId.trim() : 'MahaRERA Registered',
        possession: project.possession || 'December 2027',
        status: project.status || 'Active Work',
        featured: Boolean(project.featured),
        images: Array.isArray(project.images) && project.images.length > 0
          ? project.images
          : ['/images/og-banner.jpg'],
        amenities: Array.isArray(project.amenities) && project.amenities.length > 0
          ? project.amenities
          : ['Clubhouse', 'Gymnasium', 'Swimming Pool', 'Podium Parking'],
        createdAt: project.createdAt || now,
        updatedAt: now
      };

      if (client) {
        const query = `
          INSERT INTO projects (
            id, title, slug, developer, location, category, type,
            description, config, price_range, carpet_area, rera_id,
            possession, status, featured, images, amenities, raw_json,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
          RETURNING *;
        `;
        const values = [
          normalized.id,
          normalized.title,
          normalized.slug,
          normalized.developer,
          normalized.location,
          normalized.category,
          normalized.type,
          normalized.description,
          normalized.config,
          normalized.priceRange,
          normalized.carpetArea,
          normalized.reraId,
          normalized.possession,
          normalized.status,
          normalized.featured,
          JSON.stringify(normalized.images),
          JSON.stringify(normalized.amenities),
          JSON.stringify(normalized),
          normalized.createdAt,
          normalized.updatedAt
        ];
        await client.query(query, values);
      }

      const { data: currentList, sha } = await fetchGitHubProjects();
      const filtered = currentList.filter(p => p.id !== normalized.id);
      filtered.unshift(normalized);
      await commitGitHubProjects(filtered, sha, `feat(projects): publish ${normalized.title}`);

      return res.status(201).json({
        success: true,
        message: 'Project published successfully.',
        project: normalized
      });
    }

    if (req.method === 'PUT') {
      const project = req.body?.project;
      if (!project || !project.id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request: Project id is required for updates.'
        });
      }

      const now = new Date().toISOString();
      const normalized = {
        ...project,
        updatedAt: now
      };

      if (client) {
        const query = `
          UPDATE projects SET
            title = $2,
            slug = $3,
            developer = $4,
            location = $5,
            category = $6,
            type = $7,
            description = $8,
            config = $9,
            price_range = $10,
            carpet_area = $11,
            rera_id = $12,
            possession = $13,
            status = $14,
            featured = $15,
            images = $16,
            amenities = $17,
            raw_json = $18,
            updated_at = $19
          WHERE id = $1
          RETURNING *;
        `;
        const values = [
          normalized.id,
          normalized.title,
          normalized.slug || normalized.id,
          normalized.developer,
          normalized.location,
          normalized.category,
          normalized.type,
          normalized.description,
          normalized.config,
          normalized.priceRange,
          normalized.carpetArea,
          normalized.reraId,
          normalized.possession,
          normalized.status,
          Boolean(normalized.featured),
          JSON.stringify(normalized.images || []),
          JSON.stringify(normalized.amenities || []),
          JSON.stringify(normalized),
          now
        ];
        await client.query(query, values);
      }

      const { data: currentList, sha } = await fetchGitHubProjects();
      const index = currentList.findIndex(p => p.id === normalized.id);
      if (index !== -1) {
        currentList[index] = normalized;
      } else {
        currentList.unshift(normalized);
      }
      await commitGitHubProjects(currentList, sha, `fix(projects): update ${normalized.title}`);

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully.',
        project: normalized
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request: Project id is required for deletion.'
        });
      }

      if (client) {
        await client.query('DELETE FROM projects WHERE id = $1', [id]);
      }

      const { data: currentList, sha } = await fetchGitHubProjects();
      const filtered = currentList.filter(p => p.id !== id);
      await commitGitHubProjects(filtered, sha, `chore(projects): delete project ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully.'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (client) client.release();
  }
}