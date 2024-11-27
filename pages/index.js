// pages/index.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);

  // Load saved videos when the component first renders
  useEffect(() => {
    const loadSavedVideos = async () => {
      try {
        const response = await fetch('/api/load-videos');
        if (response.ok) {
          const savedVideos = await response.json();
          setVideos(savedVideos);
        }
      } catch (error) {
        console.error('Error loading saved videos:', error);
      }
    };

    loadSavedVideos();
  }, []);

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchVideoTitle = async (url) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get-video-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch video title');
      }
      
      const data = await response.json();
      setNewVideoTitle(data.title);
    } catch (error) {
      console.error('Error fetching video title:', error);
      setNewVideoTitle('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setNewVideoUrl(url);
    
    const videoId = extractVideoId(url);
    if (videoId) {
      fetchVideoTitle(url);
    }
  };

  const addVideo = async () => {
    if (!newVideoUrl) return;

    const newVideo = {
      id: Date.now(),
      url: newVideoUrl,
      title: newVideoTitle || 'Untitled Video',
      category: newVideoCategory || 'Uncategorized',
      addedAt: new Date().toLocaleString()
    };

    const updatedVideos = [newVideo, ...videos];
    setVideos(updatedVideos);
    setNewVideoUrl('');
    setNewVideoTitle('');
    setNewVideoCategory('');

    // Persist videos to server
    try {
      await fetch('/api/save-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVideos)
      });
    } catch (error) {
      console.error('Error saving videos:', error);
    }
  };

  const deleteVideo = async (id) => {
    const updatedVideos = videos.filter(video => video.id !== id);
    setVideos(updatedVideos);

    // Persist updated videos to server
    try {
      await fetch('/api/save-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVideos)
      });
    } catch (error) {
      console.error('Error saving videos:', error);
    }
  };

  const startEditingCategory = (video) => {
    setEditingVideoId(video.id);
  };

  const updateVideoCategory = async (id, newCategory) => {
    const updatedVideos = videos.map(video => 
      video.id === id 
        ? { ...video, category: newCategory || 'Uncategorized' } 
        : video
    );

    setVideos(updatedVideos);
    setEditingVideoId(null);

    // Persist updated videos to server
    try {
      await fetch('/api/save-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVideos)
      });
    } catch (error) {
      console.error('Error saving videos:', error);
    }
  };

  return (
    <>
      <Head>
        <title>YouTube Watchlist</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="container">
        <h1>📺 YouTube Watchlist</h1>
        <div className="input-section">
          <input 
            type="text" 
            placeholder="YouTube Video URL" 
            value={newVideoUrl}
            onChange={handleUrlChange}
          />
          <input 
            type="text" 
            placeholder="Video Title" 
            value={newVideoTitle}
            onChange={(e) => setNewVideoTitle(e.target.value)}
            disabled={isLoading}
          />
          <input 
            type="text" 
            placeholder="Category" 
            value={newVideoCategory}
            onChange={(e) => setNewVideoCategory(e.target.value)}
          />
          <button 
            onClick={addVideo} 
            disabled={!newVideoUrl || isLoading}
          >
            {isLoading ? '🔄 Loading...' : 'Add Video'}
          </button>
        </div>
        <div className="video-list">
          {videos.map(video => (
            <div key={video.id} className="video-item">
              <div className="video-details">
                {editingVideoId === video.id ? (
                  <input 
                    type="text" 
                    defaultValue={video.category}
                    onBlur={(e) => updateVideoCategory(video.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateVideoCategory(video.id, e.target.value);
                      }
                    }}
                    autoFocus
                    className="category-edit"
                  />
                ) : (
                  <span 
                    className="category" 
                    onClick={() => startEditingCategory(video)}
                  >
                    {video.category || 'Uncategorized'}
                  </span>
                )}
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {video.title}
                </a>
                <span className="timestamp">{video.addedAt}</span>
              </div>
              <button 
                className="delete-btn" 
                onClick={() => deleteVideo(video.id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        :root {
          --primary-color: #4CAF50;
          --secondary-color: #f44336;
          --text-color: #333;
          --background-color: #f4f4f4;
          --card-background: #f9f9f9;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: var(--background-color);
          line-height: 1.6;
          color: var(--text-color);
          padding: 20px;
        }

        .container {
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          padding: 20px;
        }

        h1 {
          text-align: center;
          color: var(--text-color);
          margin-bottom: 20px;
        }

        .input-section {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .input-section input,
        .input-section button {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 100px;
        }

        .input-section button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .input-section button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        input:focus, 
        button:focus {
          outline: 2px solid var(--primary-color);
          border-color: var(--primary-color);
        }

        input:disabled {
          background-color: #f0f0f0;
          cursor: not-allowed;
        }

        .video-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .video-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--card-background);
          padding: 12px;
          border-radius: 4px;
        }

        .video-details {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          margin-right: 10px;
        }

        .category {
          font-size: 0.8em;
          color: #666;
          cursor: pointer;
          margin-bottom: 5px;
        }

        .category-edit {
          margin-bottom: 5px;
        }

        .video-details a {
          text-decoration: none;
          color: #1a73e8;
          margin-bottom: 5px;
        }

        .timestamp {
          color: #666;
          font-size: 0.8em;
        }

        .delete-btn {
          background-color: var(--secondary-color);
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }

        @media screen and (max-width: 480px) {
          .container {
            padding: 10px;
          }

          .input-section {
            flex-direction: column;
          }

          .input-section input,
          .input-section button {
            width: 100%;
          }

          .video-item {
            flex-direction: column;
            align-items: stretch;
          }

          .video-details {
            margin-right: 0;
            margin-bottom: 10px;
          }

          .delete-btn {
            align-self: stretch;
          }
        }

        @media (pointer: coarse) {
          .input-section input,
          .input-section button,
          .delete-btn {
            min-height: 44px;
          }
        }
      `}</style>
    </>
  );
}