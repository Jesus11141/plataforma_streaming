const express = require('express');
const linkGenerator = require('../services/linkGenerator');
const advancedLinkGenerator = require('../services/advancedLinkGenerator');
const axios = require('axios');
const router = express.Router();

// Generar enlace de streaming con auto-refresh
router.post('/generate-link', async (req, res) => {
  try {
    const { movieId, sourceUrl, forceRefresh = false } = req.body;

    if (!movieId || !sourceUrl) {
      return res.status(400).json({ 
        error: 'movieId y sourceUrl son requeridos' 
      });
    }

    // Si se solicita refresh, limpiar cache primero
    if (forceRefresh) {
      const cacheKey = `${movieId}_${sourceUrl}`;
      if (linkGenerator.cache && linkGenerator.cache.has(cacheKey)) {
        linkGenerator.cache.delete(cacheKey);
        console.log('🗑️ Cache limpiado para regenerar enlace');
      }
    }

    const generator = linkGenerator;
    const streamUrl = await generator.generateStreamLink(movieId, sourceUrl);
    
    res.json({
      success: true,
      url: streamUrl,
      expires: Date.now() + (5 * 60 * 1000), // 5 minutos
      movieId,
      method: 'enhanced',
      refreshed: forceRefresh
    });

  } catch (error) {
    console.error('Error generando enlace:', error);
    res.status(500).json({
      success: false,
      error: 'No se pudo generar el enlace de streaming'
    });
  }
});

// Obtener múltiples enlaces
router.post('/generate-multiple', async (req, res) => {
  try {
    const { requests } = req.body; // Array de {movieId, sourceUrl}

    if (!Array.isArray(requests)) {
      return res.status(400).json({ 
        error: 'requests debe ser un array' 
      });
    }

    const results = await Promise.allSettled(
      requests.map(async ({ movieId, sourceUrl }) => {
        const url = await linkGenerator.generateStreamLink(movieId, sourceUrl);
        return { movieId, url, success: true };
      })
    );

    const response = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          movieId: requests[index].movieId,
          success: false,
          error: result.reason.message
        };
      }
    });

    res.json({ results: response });

  } catch (error) {
    console.error('Error generando enlaces múltiples:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando solicitudes múltiples'
    });
  }
});

// Verificar estado del enlace
router.get('/verify/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ 
        error: 'URL es requerida' 
      });
    }

    // Verificar si la URL sigue siendo válida
    const response = await axios.head(url);
    const isValid = response.status >= 200 && response.status < 300;

    res.json({
      movieId,
      url,
      isValid,
      status: response.status
    });

  } catch (error) {
    res.json({
      movieId: req.params.movieId,
      url: req.query.url,
      isValid: false,
      error: error.message
    });
  }
});

// Estadísticas del cache
router.get('/cache/stats', (req, res) => {
  try {
    const stats = linkGenerator.getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Limpiar cache
router.post('/cache/clean', (req, res) => {
  try {
    linkGenerator.cleanExpiredCache();
    res.json({ success: true, message: 'Cache limpiado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;