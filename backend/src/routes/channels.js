const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Obtener listas importadas
router.get('/lists', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('list_id, list_name')
      .not('list_id', 'is', null);

    if (error) throw error;

    // Agrupar por list_id con conteo
    const lists = {};
    data.forEach(c => {
      if (!lists[c.list_id]) {
        lists[c.list_id] = { list_id: c.list_id, list_name: c.list_name, count: 0 };
      }
      lists[c.list_id].count++;
    });

    res.json(Object.values(lists));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrar todos los canales sin list_id
router.delete('/all/manual', async (req, res) => {
  try {
    const { error } = await supabase
      .from('channels')
      .delete()
      .is('list_id', null);
    if (error) throw error;
    res.json({ message: 'Todos los canales eliminados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrar lista completa
router.delete('/list/:listId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('list_id', req.params.listId);

    if (error) throw error;
    res.json({ message: 'Lista eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parsear e importar M3U directamente desde el backend
router.post('/import-m3u', async (req, res) => {
  try {
    const { url, listName } = req.body;
    if (!url) return res.status(400).json({ error: 'URL requerida' });

    const axios = require('axios');
    const response = await axios.get(url, {
      maxRedirects: 10,
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      },
      responseType: 'text'
    });

    const lines = response.data.split('\n').map(l => l.trim()).filter(Boolean);
    const channels = [];
    let current = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#EXTINF')) {
        current = {};
        const nameMatch = line.match(/,([^,]+)$/);
        if (nameMatch) current.name = nameMatch[1].trim();
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        if (logoMatch) current.logo = logoMatch[1];
        const groupMatch = line.match(/group-title="([^"]+)"/);
        if (groupMatch) current.category = groupMatch[1];
        const countryMatch = line.match(/tvg-country="([^"]+)"/);
        if (countryMatch) current.country = countryMatch[1];
      } else if (!line.startsWith('#') && current.name && line.startsWith('http')) {
        current.stream_url = line.trim();
        current.country = current.country || 'Internacional';
        current.category = current.category || 'Entretenimiento';
        channels.push({ ...current });
        current = {};
      }
    }

    if (channels.length === 0) return res.status(400).json({ error: 'No se encontraron canales' });

    const listId = `list_${Date.now()}`;
    const finalListName = listName || url;
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < channels.length; i += batchSize) {
      const batch = channels.slice(i, i + batchSize).map(c => ({
        name: c.name,
        logo: c.logo || null,
        category: c.category,
        country: c.country,
        stream_url: c.stream_url,
        active: true,
        list_id: listId,
        list_name: finalListName
      }));
      const { error } = await supabase.from('channels').insert(batch);
      if (!error) inserted += batch.length;
    }

    res.json({ success: true, total: channels.length, inserted, listId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parsear e importar M3U directamente desde el backend en lotes
router.post('/import-m3u', async (req, res) => {
  try {
    const { url, listName } = req.body;
    if (!url) return res.status(400).json({ error: 'URL requerida' });

    const axios = require('axios');
    const response = await axios.get(url, {
      maxRedirects: 10,
      timeout: 60000,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' },
      responseType: 'text'
    });

    const lines = response.data.split('\n').map(l => l.trim()).filter(Boolean);
    const channels = [];
    let current = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#EXTINF')) {
        current = {};
        const nameMatch = line.match(/,([^,]+)$/);
        if (nameMatch) current.name = nameMatch[1].trim();
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        if (logoMatch) current.logo = logoMatch[1];
        const groupMatch = line.match(/group-title="([^"]+)"/);
        if (groupMatch) current.category = groupMatch[1];
        const countryMatch = line.match(/tvg-country="([^"]+)"/);
        if (countryMatch) current.country = countryMatch[1];
      } else if (!line.startsWith('#') && current.name && line.startsWith('http')) {
        channels.push({
          name: current.name,
          logo: current.logo || null,
          category: current.category || 'Entretenimiento',
          country: current.country || 'Internacional',
          stream_url: line.trim(),
          active: true
        });
        current = {};
      }
    }

    if (channels.length === 0) return res.status(400).json({ error: 'No se encontraron canales' });

    const listId = `list_${Date.now()}`;
    const finalListName = listName || url;
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < channels.length; i += batchSize) {
      const batch = channels.slice(i, i + batchSize).map(c => ({ ...c, list_id: listId, list_name: finalListName }));
      const { error } = await supabase.from('channels').insert(batch);
      if (!error) inserted += batch.length;
      else console.error('Error lote:', error.message);
    }

    res.json({ success: true, total: channels.length, inserted, listId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch M3U desde URL (sigue redirects, evita CORS)
router.get('/fetch-m3u', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL requerida' });

    const axios = require('axios');
    const response = await axios.get(url, {
      maxRedirects: 10,
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, */*',
        'Referer': new URL(url).origin,
        'Origin': new URL(url).origin
      },
      responseType: 'text'
    });

    const content = response.data;

    // Si no es M3U8 válido, intentar con la URL directa sin proxy
    if (!content.includes('#EXTM3U') && !content.includes('#EXT-X-')) {
      console.error('🔴 Respuesta no es M3U8:', content.substring(0, 200));
      return res.status(502).json({ error: 'El servidor no devuelvió un M3U8 válido', raw: content.substring(0, 200) });
    }

    // Reescribir URLs de segmentos para que pasen por el proxy
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    let rewritten = content.replace(/^(?!#)(.+)$/gm, (match) => {
      const trimmed = match.trim();
      if (!trimmed) return match;
      const absUrl = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
      if (trimmed.includes('.m3u8')) return `/api/channels/fetch-m3u?url=${encodeURIComponent(absUrl)}`;
      return `/api/channels/proxy-segment?url=${encodeURIComponent(absUrl)}`;
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/x-mpegURL');
    res.send(rewritten);
  } catch (error) {
    console.error('🔴 fetch-m3u error:', error.message);
    res.status(500).json({ error: 'No se pudo cargar: ' + error.message });
  }
});

// Proxy para segmentos .ts
router.get('/proxy-segment', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL requerida');
    const axios = require('axios');
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(url).origin,
        'Origin': new URL(url).origin
      }
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type'] || 'video/MP2T');
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// Proxy para streams M3U8 (evita CORS)
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL requerida' });

    const axios = require('axios');
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(url).origin,
        'Origin': new URL(url).origin
      },
      timeout: 10000
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/x-mpegURL');
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los canales
router.get('/', async (req, res) => {
  try {
    const { country, category } = req.query;
    let query = supabase.from('channels').select('*');
    
    if (country) query = query.eq('country', country);
    if (category) query = query.eq('category', category);
    
    const { data, error } = await query.eq('active', true);
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener canal por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Canal no encontrado' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo canal
router.post('/', async (req, res) => {
  try {
    console.log('📺 Datos del canal recibidos:', JSON.stringify(req.body, null, 2));
    
    const cleanData = {
      name: req.body.name,
      country: req.body.country,
      logo: req.body.logo,
      category: req.body.category,
      stream_url: req.body.stream_url,
      active: req.body.active !== false
    };
    
    const { data, error } = await supabase
      .from('channels')
      .insert([cleanData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error Supabase:', error);
      throw error;
    }
    
    console.log('✅ Canal creado:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('💥 Error completo:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.details || 'Sin detalles adicionales'
    });
  }
});

// Actualizar canal
router.put('/:id', async (req, res) => {
  try {
    const cleanData = {
      name: req.body.name,
      country: req.body.country,
      logo: req.body.logo,
      category: req.body.category,
      stream_url: req.body.stream_url,
      active: req.body.active
    };
    
    const { data, error } = await supabase
      .from('channels')
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

// Eliminar canal
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'Canal eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;