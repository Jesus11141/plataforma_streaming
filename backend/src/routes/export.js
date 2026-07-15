const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Exportar lista M3U
router.get('/export-m3u', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .not('streams', 'is', null);
    
    if (error) throw error;
    
    let m3uContent = '#EXTM3U\n';
    
    data.forEach(movie => {
      if (movie.streams && Array.isArray(movie.streams)) {
        movie.streams.forEach(stream => {
          if (stream.active) {
            m3uContent += `#EXTINF:-1 tvg-name="${movie.title}" tvg-logo="${movie.poster}" group-title="${movie.genre.join(',')}", ${movie.title} (${movie.year}) - ${stream.quality}\n`;
            m3uContent += `${stream.url}\n`;
          }
        });
      }
    });
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="raulflix_playlist.m3u"');
    res.send(m3uContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exportar JSON para apps
router.get('/export-json', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*');
    
    if (error) throw error;
    
    res.json({
      playlist_name: 'RaulFlix',
      created_at: new Date().toISOString(),
      total_movies: data.length,
      movies: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;