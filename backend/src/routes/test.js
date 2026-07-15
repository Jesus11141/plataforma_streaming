const express = require('express');
const advancedLinkGenerator = require('../services/advancedLinkGenerator');
const router = express.Router();

// Test del generador avanzado
router.post('/test-advanced', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL requerida' });
    }

    console.log('🧪 Probando generador avanzado con:', url);
    
    const result = await advancedLinkGenerator.generateStreamLink('test', url);
    
    res.json({
      success: true,
      originalUrl: url,
      extractedUrl: result,
      method: 'puppeteer',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en test avanzado:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cerrar navegador (para limpieza)
router.post('/cleanup', async (req, res) => {
  try {
    await advancedLinkGenerator.closeBrowser();
    res.json({ success: true, message: 'Navegador cerrado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;