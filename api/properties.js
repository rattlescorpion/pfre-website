/**
 * api/properties.js
 * Property Finder Real Estate (PFRE)
 *
 * Purpose:
 *   Public GET endpoint for reading property listings.
 *
 * Data source:
 *   GitHub repository file: data/properties.json
 *
 * Security:
 *   - GET requests only.
 *   - No GitHub token is returned to the client.
 *   - No property data is modified.
 *   - Errors do not expose credentials.
 */

const GITHUB_API = 'https://api.github.com';
const DATA_PATH = 'data/properties.json';

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  return res.end(JSON.stringify(data));
}

function getPropertyList(data) {
  // Support a JSON file containing a direct array.
  if (Array.isArray(data)) {
    return data;
  }

  // Support common object-based JSON formats.
  if (data && typeof data === 'object') {
    if (Array.isArray(data.properties)) {
      return data.properties;
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, {
      success: false,
      error: 'Method not allowed.'
    });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    return sendJson(res, 500, {
      success: false,
      error: 'Property storage is not configured.'
    });
  }

  try {
    const url =
      `${GITHUB_API}/repos/${encodeURIComponent(owner)}` +
      `/${encodeURIComponent(repo)}/contents/${DATA_PATH}` +
      `?ref=${encodeURIComponent(branch)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      cache: 'no-store'
    });

    if (response.status === 404) {
      return sendJson(res, 200, {
        success: true,
        properties: []
      });
    }

    if (!response.ok) {
      return sendJson(res, 502, {
        success: false,
        error: 'Unable to retrieve property listings.'
      });
    }

    const file = await response.json();

    if (
      typeof file.content !== 'string' ||
      file.encoding !== 'base64'
    ) {
      return sendJson(res, 502, {
        success: false,
        error: 'Property data has an unexpected format.'
      });
    }

    const decoded = Buffer.from(
      file.content.replace(/\s/g, ''),
      'base64'
    ).toString('utf8');

    let parsed;

    try {
      parsed = JSON.parse(decoded);
    } catch {
      return sendJson(res, 502, {
        success: false,
        error: 'Property data is not valid JSON.'
      });
    }

    const properties = getPropertyList(parsed);

    if (!properties) {
      return sendJson(res, 502, {
        success: false,
        error: 'Property data has an unexpected structure.'
      });
    }

    return sendJson(res, 200, {
      success: true,
      properties
    });
  } catch {
    return sendJson(res, 500, {
      success: false,
      error: 'An unexpected error occurred while loading properties.'
    });
  }
}