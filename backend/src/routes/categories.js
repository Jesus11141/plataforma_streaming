const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Obtener géneros disponibles
router.get('/genres', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('genre');
    
    if (error) throw error;
    
    // Extraer géneros únicos
    const genres = [...new Set(data.flatMap(movie => movie.genre || []))];
    res.json(genres.sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener años disponibles
router.get('/years', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('year')
      .not('year', 'is', null);
    
    if (error) throw error;
    
    const years = [...new Set(data.map(movie => movie.year))];
    res.json(years.sort((a, b) => b - a));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;