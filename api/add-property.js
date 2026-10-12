/**
 * api/add-property.js
 * Property Finder Real Estate - Mumbai
 * Vercel Serverless Function to publish residential & commercial listings
 */

import { Pool } from 'pg';

let pool;
if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

  try {
    const { adminPassword, property } = req.body || {};

    const expectedPassword = process.env.ADMIN_PASSWORD || 'pfre2026';
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const providedSecret = adminPassword || bearerToken;

    if (!providedSecret || providedSecret !== expectedPassword) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid admin security credentials.'
      });
    }

    if (!property || typeof property !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request: Property payload is required.'
      });
    }

    if (!property.title || !property.locality || !property.priceDisplay) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request: title, locality, and priceDisplay are required fields.'
      });
    }

    const propId = property.id || 'pfre-' + Date.now().toString(36);
    const cleanedProperty = {
      id: propId,
      title: property.title.trim(),
      intent: ['buy', 'rent', 'commercial'].includes(property.intent) ? property.intent : 'buy',
      bhk: parseInt(property.bhk, 10) || 2,
      locality: property.locality.trim(),
      address: property.address ? property.address.trim() : property.locality.trim() + ', Mumbai',
      priceDisplay: property.priceDisplay.trim(),
      priceNumeric: parseInt(property.priceNumeric, 10) || 0,
      carpetArea: parseInt(property.carpetArea, 10) || 0,
      bathrooms: parseInt(property.bathrooms, 10) || 2,
      floor: property.floor || 'Middle Floor',
      reraId: property.reraId ? property.reraId.trim() : 'MahaRERA Verified',
      featured: Boolean(property.featured),
      images: Array.isArray(property.images) && property.images.length > 0
        ? property.images
        : ['/images/og-banner.jpg'],
      amenities: Array.isArray(property.amenities) ? property.amenities : [
        'Lift / Elevators',
        '24/7 Security & CCTV',
        'Covered Parking'
      ],
      createdAt: property.createdAt || new Date().toISOString()
    };

    let dbSaved = false;
    if (pool) {
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
          );
        `);

        const insertQuery = `
          INSERT INTO properties (
            id, title, intent, bhk, locality, address, price_display,
            price_numeric, carpet_area, bathrooms, floor, rera_id,
            featured, images, amenities, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
            amenities = EXCLUDED.amenities;
        `;

        await client.query(insertQuery, [
          cleanedProperty.id,
          cleanedProperty.title,
          cleanedProperty.intent,
          cleanedProperty.bhk,
          cleanedProperty.locality,
          cleanedProperty.address,
          cleanedProperty.priceDisplay,
          cleanedProperty.priceNumeric,
          cleanedProperty.carpetArea,
          cleanedProperty.bathrooms,
          cleanedProperty.floor,
          cleanedProperty.reraId,
          cleanedProperty.featured,
          JSON.stringify(cleanedProperty.images),
          JSON.stringify(cleanedProperty.amenities),
          cleanedProperty.createdAt
        ]);
        dbSaved = true;
      } catch (dbErr) {
        console.error('Postgres write warning:', dbErr.message);
      } finally {
        client.release();
      }
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.REPO_OWNER;
    const repoName = process.env.REPO_NAME;
    const filePath = 'data/properties.json';
    let gitHubCommitted = false;

    if (githubToken && repoOwner && repoName) {
      const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
      const gitHeaders = {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'PFRE-Admin-Portal'
      };

      const getRes = await fetch(getFileUrl, { headers: gitHeaders });
      let currentProperties = [];
      let fileSha = null;

      if (getRes.ok) {
        const fileData = await getRes.json();
        fileSha = fileData.sha;
        const decoded = Buffer.from(fileData.content, 'base64').toString('utf8');
        try {
          currentProperties = JSON.parse(decoded);
          if (!Array.isArray(currentProperties)) currentProperties = [];
        } catch {
          currentProperties = [];
        }
      }

      currentProperties = currentProperties.filter(p => p.id !== cleanedProperty.id);
      currentProperties.unshift(cleanedProperty);

      const updatedBase64 = Buffer.from(
        JSON.stringify(currentProperties, null, 2),
        'utf8'
      ).toString('base64');

      const putRes = await fetch(getFileUrl, {
        method: 'PUT',
        headers: {
          ...gitHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `feat(catalog): publish listing ${cleanedProperty.title}`,
          content: updatedBase64,
          ...(fileSha ? { sha: fileSha } : {})
        })
      });

      gitHubCommitted = putRes.ok;
    }

    return res.status(200).json({
      success: true,
      message: 'Property published successfully.',
      property: cleanedProperty,
      storage: {
        database: dbSaved,
        github: gitHubCommitted
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}