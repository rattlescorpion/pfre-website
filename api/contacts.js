/**
 * api/contacts.js
 * Universal Contact Directory Backend for Property Finder Real Estate
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = process.env.REPO_OWNER;
  const REPO_NAME = process.env.REPO_NAME;
  const FILE_PATH = 'data/contacts.json';
  const EXPECTED_PASSWORD = process.env.ADMIN_PASSWORD || 'pfre2026';

  // 1. Authorize modifications
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const bodySecret = req.body?.adminPassword;

    if ((token || bodySecret) !== EXPECTED_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin PIN' });
    }
  }

  // 2. Fetch existing contacts helper
  async function fetchFileFromGitHub() {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) return { data: null, sha: null };
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'PFRE-Omni-Contacts'
      }
    });

    if (resp.status === 404) return { data: [], sha: null };
    if (!resp.ok) throw new Error(`GitHub Read Error: ${resp.statusText}`);

    const file = await resp.json();
    const content = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
    return { data: Array.isArray(content) ? content : [], sha: file.sha };
  }

  // 3. Commit updated contacts helper
  async function commitFileToGitHub(contentArray, sha, message) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const contentBase64 = Buffer.from(JSON.stringify(contentArray, null, 2), 'utf8').toString('base64');
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'PFRE-Omni-Contacts'
      },
      body: JSON.stringify({ message, content: contentBase64, ...(sha ? { sha } : {}) })
    });

    if (!resp.ok) throw new Error(`GitHub Commit Error: ${resp.statusText}`);
    return await resp.json();
  }

  try {
    // GET: Retrieve Contacts
    if (req.method === 'GET') {
      const { data } = await fetchFileFromGitHub();
      return res.status(200).json({ success: true, contacts: data || [] });
    }

    // POST: Create Contact
    if (req.method === 'POST') {
      const newContact = req.body.contact;
      if (!newContact || !newContact.name?.displayName) {
        return res.status(400).json({ success: false, error: 'Display Name is required.' });
      }

      newContact.id = newContact.id || 'c-' + Date.now().toString(36);
      newContact.createdAt = new Date().toISOString();
      newContact.updatedAt = new Date().toISOString();

      const { data: contacts, sha } = await fetchFileFromGitHub();
      const list = contacts || [];
      list.unshift(newContact);

      if (GITHUB_TOKEN) {
        await commitFileToGitHub(list, sha, `feat(contacts): add ${newContact.name.displayName}`);
      }

      return res.status(201).json({ success: true, contact: newContact });
    }

    // PUT: Update Contact
    if (req.method === 'PUT') {
      const updatedContact = req.body.contact;
      if (!updatedContact || !updatedContact.id) {
        return res.status(400).json({ success: false, error: 'Contact ID required.' });
      }

      updatedContact.updatedAt = new Date().toISOString();
      const { data: contacts, sha } = await fetchFileFromGitHub();
      let list = contacts || [];
      const index = list.findIndex(c => c.id === updatedContact.id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Contact not found.' });
      }

      list[index] = { ...list[index], ...updatedContact };

      if (GITHUB_TOKEN) {
        await commitFileToGitHub(list, sha, `fix(contacts): update ${updatedContact.name.displayName}`);
      }

      return res.status(200).json({ success: true, contact: list[index] });
    }

    // DELETE: Delete Contact
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ success: false, error: 'Contact ID required.' });

      const { data: contacts, sha } = await fetchFileFromGitHub();
      let list = contacts || [];
      const filtered = list.filter(c => c.id !== id);

      if (GITHUB_TOKEN) {
        await commitFileToGitHub(filtered, sha, `feat(contacts): remove contact ${id}`);
      }

      return res.status(200).json({ success: true, message: 'Contact deleted.' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}