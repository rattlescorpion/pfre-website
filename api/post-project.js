/**
 * api/post-project.js
 * Vercel Serverless Function to publish new real estate projects
 * Commits project data directly to data/projects.json via GitHub REST API
 */

export default async function handler(req, res) {
  // 1. CORS Preflight & Headers
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
    const { adminPassword, project } = req.body || {};

    // 2. Authentication Verification
    const EXPECTED_PASSWORD = process.env.ADMIN_PASSWORD || 'pfre2026';
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const providedSecret = adminPassword || bearerToken;

    if (!providedSecret || providedSecret !== EXPECTED_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid admin credentials or PIN.'
      });
    }

    // 3. Payload Validation
    if (!project || typeof project !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request: "project" payload is missing or invalid.'
      });
    }

    if (!project.title || !project.developer || !project.location) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request: Project "title", "developer", and "location" are required fields.'
      });
    }

    // 4. GitHub Environment Configuration
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME = process.env.REPO_NAME;
    const FILE_PATH = 'data/projects.json';

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      return res.status(500).json({
        success: false,
        error: 'Server Misconfiguration: GITHUB_TOKEN, REPO_OWNER, or REPO_NAME is missing from Vercel environment variables.'
      });
    }

    // 5. Structure & Sanitize New Project Record
    const slug = (project.slug || project.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProject = {
      id: project.id || `proj-${slug}-${Date.now().toString().slice(-4)}`,
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
      reraId: project.reraId ? project.reraId.trim() : 'MahaRERA Applied',
      possession: project.possession || 'Immediate OC',
      status: project.status || 'Active',
      images: Array.isArray(project.images) && project.images.length > 0 
        ? project.images 
        : ['/images/og-banner.jpg'],
      featured: Boolean(project.featured),
      createdAt: project.createdAt || new Date().toISOString()
    };

    // 6. Fetch Existing data/projects.json from GitHub
    const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'PFRE-Admin-Portal'
    };

    const getRes = await fetch(githubApiUrl, { headers });
    let existingProjects = [];
    let fileSha = null;

    if (getRes.ok) {
      const fileData = await getRes.json();
      fileSha = fileData.sha;
      const rawContent = Buffer.from(fileData.content, 'base64').toString('utf8');
      try {
        existingProjects = JSON.parse(rawContent);
        if (!Array.isArray(existingProjects)) existingProjects = [];
      } catch {
        existingProjects = [];
      }
    } else if (getRes.status === 404) {
      // File does not exist yet; create it as a fresh array
      existingProjects = [];
    } else {
      const errText = await getRes.text();
      return res.status(getRes.status).json({
        success: false,
        error: `GitHub API Error fetching ${FILE_PATH}: ${errText}`
      });
    }

    // 7. Prepend New Project
    existingProjects.unshift(newProject);

    // 8. Commit Updated File Back to GitHub
    const updatedContentBase64 = Buffer.from(
      JSON.stringify(existingProjects, null, 2),
      'utf8'
    ).toString('base64');

    const commitPayload = {
      message: `feat(projects): publish project "${newProject.title}" via Admin Portal`,
      content: updatedContentBase64,
      ...(fileSha ? { sha: fileSha } : {})
    };

    const putRes = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commitPayload)
    });

    if (!putRes.ok) {
      const putError = await putRes.text();
      return res.status(putRes.status).json({
        success: false,
        error: `GitHub API Commit Failed: ${putError}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Project "${newProject.title}" committed successfully. Vercel deployment triggered.`,
      project: newProject
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Internal Server Error: ${error.message}`
    });
  }
}