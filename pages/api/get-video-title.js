export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  
    try {
      const { url } = req.body;
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
      
      if (!videoId) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }
  
      const apiResponse = await fetch(`https://youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await apiResponse.json();
      res.status(200).json({ title: data.title });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch video title' });
    }
  }