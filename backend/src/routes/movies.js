const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Obtener todas las películas
router.get('/', async (req, res) => {
  try {
    const { genre, year, search } = req.query;
    let query = supabase.from('movies').select('*');
    
    if (genre) query = query.contains('genre', [genre]);
    if (year) query = query.eq('year', year);
    if (search) query = query.ilike('title', `%${search}%`);
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener película por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Película no encontrada' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nueva película
router.post('/', async (req, res) => {
  try {
    console.log('📝 Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    // Limpiar datos - solo enviar campos que existen en la tabla
    const cleanData = {
      title: req.body.title,
      description: req.body.description,
      year: req.body.year,
      genre: req.body.genre,
      poster: req.body.poster,
      trailer: req.body.trailer,
      duration: req.body.duration,
      rating: req.body.rating,
      country: req.body.country,
      language: req.body.language,
      type: req.body.type || 'movie', // Agregar tipo
      streams: req.body.streams
    };
    
    console.log('🧹 Datos limpios:', JSON.stringify(cleanData, null, 2));
    
    const { data, error } = await supabase
      .from('movies')
      .insert([cleanData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error Supabase:', error);
      throw error;
    }
    
    console.log('✅ Película creada:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('💥 Error completo:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.details || 'Sin detalles adicionales',
      hint: error.hint || 'Sin sugerencias'
    });
  }
});

// Eliminar película
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Contenido eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar película
router.put('/:id', async (req, res) => {
  try {
    console.log('🔄 Actualizando contenido:', req.params.id);
    
    const cleanData = {
      title: req.body.title,
      description: req.body.description,
      year: req.body.year,
      genre: req.body.genre,
      poster: req.body.poster,
      trailer: req.body.trailer,
      duration: req.body.duration,
      rating: req.body.rating,
      country: req.body.country,
      language: req.body.language,
      type: req.body.type,
      streams: req.body.streams
    };
    
    const { data, error } = await supabase
      .from('movies')
      .update(cleanData)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;