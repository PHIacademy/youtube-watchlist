import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // First check if we have the connection string
    if (!process.env.POSTGRES_URL) {
      throw new Error('Database connection string not found in environment variables');
    }

    // First command: Create table
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id BIGINT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        added_at TEXT
      )
    `;

    // Second command: Test query
    const result = await sql`SELECT NOW()`;

    return res.status(200).json({ 
      success: true, 
      message: 'Database connected successfully!',
      serverTime: result.rows[0].now,
      env: {
        hasUrl: !!process.env.POSTGRES_URL,
        hasUser: !!process.env.POSTGRES_USER,
        hasHost: !!process.env.POSTGRES_HOST,
        hasDatabase: !!process.env.POSTGRES_DATABASE
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to connect to database',
      error: error.message,
      env: {
        hasUrl: !!process.env.POSTGRES_URL,
        hasUser: !!process.env.POSTGRES_USER,
        hasHost: !!process.env.POSTGRES_HOST,
        hasDatabase: !!process.env.POSTGRES_DATABASE
      }
    });
  }
}