import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = await pool.connect();

  try {
    // 1. GET: Fetch all contacts from database
    if (req.method === 'GET') {
      const result = await client.query(
        'SELECT * FROM contacts ORDER BY created_at DESC'
      );
      return res.status(200).json({ success: true, contacts: result.rows });
    }

    // 2. POST: Insert new contact
    if (req.method === 'POST') {
      const { contact } = req.body || {};
      if (!contact || !contact.name || !contact.phone) {
        return res.status(400).json({ success: false, error: 'Name and phone are required.' });
      }

      const id = contact.id || 'c-' + Date.now().toString(36);
      const query = `
        INSERT INTO contacts (
          id, name, phone, email, contact_type, budget_range,
          pan_number, address, notes, assigned_agent, stage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;

      const values = [
        id,
        contact.name.trim(),
        contact.phone.trim(),
        contact.email ? contact.email.trim() : null,
        contact.contactType || 'Buyer',
        contact.budgetRange || null,
        contact.panNumber ? contact.panNumber.toUpperCase() : null,
        contact.address || null,
        contact.notes || null,
        contact.assignedAgent || 'Saurav Chowdhury',
        contact.stage || 'new'
      ];

      const result = await client.query(query, values);
      return res.status(201).json({ success: true, contact: result.rows[0] });
    }

    // 3. PUT: Update existing contact
    if (req.method === 'PUT') {
      const { contact } = req.body || {};
      if (!contact || !contact.id) {
        return res.status(400).json({ success: false, error: 'Contact ID is required.' });
      }

      const query = `
        UPDATE contacts SET
          name = COALESCE($2, name),
          phone = COALESCE($3, phone),
          email = COALESCE($4, email),
          contact_type = COALESCE($5, contact_type),
          budget_range = COALESCE($6, budget_range),
          pan_number = COALESCE($7, pan_number),
          address = COALESCE($8, address),
          notes = COALESCE($9, notes),
          assigned_agent = COALESCE($10, assigned_agent),
          stage = COALESCE($11, stage),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
      `;

      const values = [
        contact.id,
        contact.name,
        contact.phone,
        contact.email,
        contact.contactType,
        contact.budgetRange,
        contact.panNumber,
        contact.address,
        contact.notes,
        contact.assignedAgent,
        contact.stage
      ];

      const result = await client.query(query, values);
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Contact record not found.' });
      }

      return res.status(200).json({ success: true, contact: result.rows[0] });
    }

    // 4. DELETE: Remove record from database
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) {
        return res.status(400).json({ success: false, error: 'Contact ID is required.' });
      }

      await client.query('DELETE FROM contacts WHERE id = $1', [id]);
      return res.status(200).json({ success: true, message: 'Record deleted from database.' });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}