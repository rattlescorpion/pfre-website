/**
 * api/contacts.js
 * Property Finder Real Estate - Mumbai
 * Vercel Serverless Function to manage contact directory
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
const FILE_PATH = 'data/contacts.json';
const EXPECTED_PASSWORD = process.env.ADMIN_PASSWORD || 'pfre2026';

async function fetchGitHubContacts() {
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    return { data: [], sha: null };
  }
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'PFRE-Contact-Directory'
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

async function commitGitHubContacts(contentArray, sha, message) {
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) return false;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const contentBase64 = Buffer.from(JSON.stringify(contentArray, null, 2), 'utf8').toString('base64');
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'PFRE-Contact-Directory'
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
        error: 'Unauthorized: Invalid administrative credentials.'
      });
    }
  }

  let client;
  if (pool) {
    try {
      client = await pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id VARCHAR(64) PRIMARY KEY,
          prefix VARCHAR(32),
          first_name VARCHAR(128) NOT NULL,
          last_name VARCHAR(128),
          display_name VARCHAR(255) NOT NULL,
          nickname VARCHAR(128),
          company VARCHAR(255),
          primary_phone VARCHAR(32) NOT NULL,
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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_contacts_primary_phone ON contacts(primary_phone);
        CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);
      `);
    } catch (dbInitErr) {
      console.error('Postgres init error:', dbInitErr.message);
    }
  }

  try {
    if (req.method === 'GET') {
      if (client) {
        const result = await client.query('SELECT * FROM contacts ORDER BY display_name ASC');
        if (result.rows.length > 0) {
          const formatted = result.rows.map(row => {
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
                { type: 'Mobile', number: row.primary_phone, isPrimary: true },
                { type: 'WhatsApp', number: row.wa_phone || row.primary_phone }
              ],
              emails: row.email ? [{ type: 'Primary', address: row.email }] : [],
              dates: { birthday: row.birthday, anniversary: row.anniversary },
              addresses: [{ type: 'Residence', street: row.address, city: row.city }],
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
          });
          return res.status(200).json({ success: true, contacts: formatted });
        }
      }

      const { data } = await fetchGitHubContacts();
      return res.status(200).json({ success: true, contacts: data });
    }

    if (req.method === 'POST') {
      const contact = req.body?.contact;
      if (!contact || !contact.name?.displayName) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request: Contact display name is required.'
        });
      }

      const contactId = contact.id || 'c-' + Date.now().toString(36);
      const primaryPhone = contact.phones?.[0]?.number || '';
      const waPhone = contact.phones?.[1]?.number || primaryPhone;
      const email = contact.emails?.[0]?.address || null;
      const now = new Date().toISOString();

      const normalized = {
        ...contact,
        id: contactId,
        createdAt: contact.createdAt || now,
        updatedAt: now
      };

      if (client) {
        const query = `
          INSERT INTO contacts (
            id, prefix, first_name, last_name, display_name, nickname,
            company, primary_phone, wa_phone, email, birthday,
            contact_type, budget_range, pan_number, address,
            notes, vip_starred, raw_json, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (id) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            primary_phone = EXCLUDED.primary_phone,
            wa_phone = EXCLUDED.wa_phone,
            email = EXCLUDED.email,
            contact_type = EXCLUDED.contact_type,
            budget_range = EXCLUDED.budget_range,
            pan_number = EXCLUDED.pan_number,
            address = EXCLUDED.address,
            notes = EXCLUDED.notes,
            vip_starred = EXCLUDED.vip_starred,
            raw_json = EXCLUDED.raw_json,
            updated_at = EXCLUDED.updated_at
          RETURNING *;
        `;
        const values = [
          contactId,
          contact.name?.prefix || null,
          contact.name?.firstName || contact.name.displayName,
          contact.name?.lastName || null,
          contact.name.displayName,
          contact.name?.nickname || null,
          contact.organization?.company || null,
          primaryPhone,
          waPhone,
          email,
          contact.dates?.birthday || null,
          contact.rems?.contactType || 'Buyer',
          contact.rems?.budgetRange || null,
          contact.rems?.panNumber || null,
          contact.addresses?.[0]?.street || null,
          contact.notes || null,
          Boolean(contact.rems?.vipStarred),
          JSON.stringify(normalized),
          normalized.createdAt,
          normalized.updatedAt
        ];
        await client.query(query, values);
      }

      const { data: currentList, sha } = await fetchGitHubContacts();
      const filtered = currentList.filter(c => c.id !== contactId);
      filtered.unshift(normalized);
      await commitGitHubContacts(filtered, sha, `feat(contacts): add ${normalized.name.displayName}`);

      return res.status(201).json({ success: true, contact: normalized });
    }

    if (req.method === 'PUT') {
      const contact = req.body?.contact;
      if (!contact || !contact.id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request: Contact id is required for updates.'
        });
      }

      const primaryPhone = contact.phones?.[0]?.number || '';
      const waPhone = contact.phones?.[1]?.number || primaryPhone;
      const email = contact.emails?.[0]?.address || null;
      const now = new Date().toISOString();

      const normalized = {
        ...contact,
        updatedAt: now
      };

      if (client) {
        const query = `
          UPDATE contacts SET
            prefix = $2,
            first_name = $3,
            last_name = $4,
            display_name = $5,
            nickname = $6,
            company = $7,
            primary_phone = $8,
            wa_phone = $9,
            email = $10,
            birthday = $11,
            contact_type = $12,
            budget_range = $13,
            pan_number = $14,
            address = $15,
            notes = $16,
            vip_starred = $17,
            raw_json = $18,
            updated_at = $19
          WHERE id = $1
          RETURNING *;
        `;
        const values = [
          contact.id,
          contact.name?.prefix || null,
          contact.name?.firstName || contact.name.displayName,
          contact.name?.lastName || null,
          contact.name.displayName,
          contact.name?.nickname || null,
          contact.organization?.company || null,
          primaryPhone,
          waPhone,
          email,
          contact.dates?.birthday || null,
          contact.rems?.contactType || 'Buyer',
          contact.rems?.budgetRange || null,
          contact.rems?.panNumber || null,
          contact.addresses?.[0]?.street || null,
          contact.notes || null,
          Boolean(contact.rems?.vipStarred),
          JSON.stringify(normalized),
          now
        ];
        await client.query(query, values);
      }

      const { data: currentList, sha } = await fetchGitHubContacts();
      const index = currentList.findIndex(c => c.id === contact.id);
      if (index !== -1) {
        currentList[index] = normalized;
      } else {
        currentList.unshift(normalized);
      }
      await commitGitHubContacts(currentList, sha, `fix(contacts): update ${normalized.name.displayName}`);

      return res.status(200).json({ success: true, contact: normalized });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request: Contact id is required for deletion.'
        });
      }

      if (client) {
        await client.query('DELETE FROM contacts WHERE id = $1', [id]);
      }

      const { data: currentList, sha } = await fetchGitHubContacts();
      const filtered = currentList.filter(c => c.id !== id);
      await commitGitHubContacts(filtered, sha, `chore(contacts): delete contact ${id}`);

      return res.status(200).json({
        success: true,
        message: 'Contact deleted successfully.'
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