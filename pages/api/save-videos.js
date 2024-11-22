import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const videos = req.body;
    
    // Clear existing entries
    await sql`DELETE FROM videos`;
    
    // Insert new videos
    for (const video of videos) {
      await sql`
        INSERT INTO videos (id, url, title, category, added_at)
        VALUES (${video.id}, ${video.url}, ${video.title}, ${video.category}, ${video.addedAt})
      `;
    }
    
    res.status(200).json({ message: 'Videos saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save videos' });
  }
}