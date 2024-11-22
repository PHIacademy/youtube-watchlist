import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // First check if we have the connection string
    if (!process.env.POSTGRES_URL) {
      throw new Error('Database connection string not found in environment variables');
    }

    // Step 1: Create table
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id BIGINT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        added_at TEXT
      )
    `;

    // Step 2: Test insert
    const testVideo = {
      id: Date.now(),
      url: 'https://youtube.com/test',
      title: 'Test Video',
      category: 'Test',
      added_at: new Date().toISOString()
    };

    await sql`
      INSERT INTO videos (id, url, title, category, added_at)
      VALUES (${testVideo.id}, ${testVideo.url}, ${testVideo.title}, ${testVideo.category}, ${testVideo.added_at})
    `;

    // Step 3: Test select
    const videos = await sql`SELECT * FROM videos LIMIT 1`;

    // Step 4: Test timestamp
    const timestamp = await sql`SELECT NOW()`;

    // Step 5: Clean up test data
    await sql`DELETE FROM videos WHERE url = 'https://youtube.com/test'`;

    return res.status(200).json({ 
      success: true, 
      message: 'Database connected and operations successful!',
      serverTime: timestamp.rows[0].now,
      testData: videos.rows[0],
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