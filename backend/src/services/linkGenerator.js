class SimpleLinkGenerator {
  constructor() {
    this.cache = new Map();
  }

  // Procesar URLs de diferentes servicios
  async generateStreamLink(movieId, sourceUrl) {
    console.log(`🎬 Procesando URL para movie ${movieId}: ${sourceUrl}`);
    
    // Si es Streamtape, convertir a formato embed limpio
    if (sourceUrl.includes('streamtape.com/v/')) {
      const videoId = sourceUrl.match(/\/v\/([^/]+)/)?.[1];
      if (videoId) {
        // Usar formato /e/ simple sin parámetros
        const embedUrl = `https://streamtape.com/e/${videoId}`;
        console.log(`🎬 Streamtape convertido: ${embedUrl}`);
        return embedUrl;
      }
    }
    
    // Si ya es formato embed, devolverlo sin modificar
    if (sourceUrl.includes('streamtape.com/e/')) {
      return sourceUrl.split('?')[0]; // Remover parámetros
    }
    
    // Para Bysekoze, usar formato embed directo
    if (sourceUrl.includes('bysekoze.com/v/')) {
      const videoId = sourceUrl.match(/\/v\/([^/]+)/)?.[1];
      if (videoId) {
        return `https://bysekoze.com/e/${videoId}`;
      }
    }
    
    // Para otros formatos
    if (sourceUrl.includes('.m3u8') || sourceUrl.includes('.mp4')) {
      return sourceUrl;
    }
    
    return sourceUrl;
  }

  // Verificar si la URL ya es válida para streaming
  isValidStreamUrl(url) {
    return url.includes('.m3u8') || 
           url.includes('.mp4') || 
           url.includes('master.m3u8') ||
           url.includes('streamtape.com/e/');
  }

  // Métodos vacíos para compatibilidad
  cleanExpiredCache() {
    // No hacer nada
  }

  getCacheStats() {
    return {
      size: 0,
      entries: []
    };
  }
}

module.exports = new SimpleLinkGenerator();