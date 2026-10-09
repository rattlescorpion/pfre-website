export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { adminPassword, property } = req.body;

  // Simple security check (set ADMIN_PASSWORD in Vercel Environment Variables)
  const EXPECTED_PASSWORD = process.env.ADMIN_PASSWORD || 'pfre2026';
  if (adminPassword !== EXPECTED_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Personal Access Token from GitHub
  const REPO_OWNER = process.env.REPO_OWNER;     // e.g. "your-github-username"
  const REPO_NAME = process.env.REPO_NAME;       // e.g. "pfre-website"
  const FILE_PATH = 'data/properties.json';

  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    return res.status(500).json({ error: 'GitHub credentials not configured in Vercel env' });
  }

  try {
    // 1. Fetch current properties.json and its SHA hash from GitHub
    const getFileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const getRes = await fetch(getFileUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!getRes.ok) throw new Error('Could not fetch existing properties file from GitHub');
    const fileData = await getRes.json();
    const currentContent = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));

    // 2. Prepend the new property to the top of the array
    currentContent.unshift(property);

    // 3. Commit the updated JSON back to GitHub
    const updatedBase64 = Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64');
    const putRes = await fetch(getFileUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `feat(catalog): add listing "${property.title}" via admin portal`,
        content: updatedBase64,
        sha: fileData.sha
      })
    });

    if (!putRes.ok) throw new Error('Failed to commit update to GitHub repository');

    return res.status(200).json({ success: true, message: 'Property published successfully! Deploying in 30s.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}