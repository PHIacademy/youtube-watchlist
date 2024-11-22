import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Test query to verify connection and create table if it doesn't exist
    const result = await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id BIGINT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        added_at TEXT
      );
      
      SELECT NOW();
    `;

    return res.status(200).json({ 
      success: true, 
      message: 'Database connected successfully!',
      serverTime: result[1]?.rows[0]?.now
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to connect to database',
      error: error.message 
    });
  }
}