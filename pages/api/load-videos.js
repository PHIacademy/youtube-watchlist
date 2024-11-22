import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id BIGINT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        added_at TEXT
      );
    `;

    const { rows } = await sql`SELECT * FROM videos ORDER BY added_at DESC`;
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load videos' });
  }
}