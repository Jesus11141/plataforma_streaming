const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

puppeteer.use(StealthPlugin());

class AdvancedLinkGenerator {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 20 * 60 * 1000; // 20 minutos
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--window-size=1920,1080',
        ]
      });
    }
    return this.browser;
  }

  async generateStreamLink(movieId, sourceUrl) {
    try {
      console.log(`🔍 Generando enlace para movie ${movieId} desde ${sourceUrl}`);

      const cacheKey = `${movieId}_${sourceUrl}`;

      // Verificar cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (cached.expires > Date.now()) {
          console.log('📦 Enlace encontrado en cache');
          return cached.url;
        }
        this.cache.delete(cacheKey);
      }

      let streamUrl = sourceUrl;

      // Si ya es una URL válida, usarla directamente
      if (this.isValidStreamUrl(sourceUrl)) {
        console.log('✅ URL ya es válida para streaming');
      } else {
        // Usar Puppeteer para extraer el enlace real
        streamUrl = await this.extractWithPuppeteer(sourceUrl);

        if (!streamUrl) {
          console.log('⚠️ Falló puppeteer, intentando método simple...');
          streamUrl = await this.extractWithAxios(sourceUrl) || sourceUrl;
        }
      }

      // Guardar en cache si logramos extraer algo distinto a la fuente original
      // o si la fuente original ya era válida
      if (streamUrl && streamUrl !== sourceUrl) {
        this.cache.set(cacheKey, {
          url: streamUrl,
          expires: Date.now() + this.cacheTimeout
        });
      }

      console.log('🎯 Enlace final generado:', streamUrl);
      return streamUrl;
    } catch (error) {
      console.error('❌ Error generando enlace:', error);
      throw error;
    }
  }

  async extractWithPuppeteer(sourceUrl) {
    let page = null;
    try {
      console.log('🤖 Usando Puppeteer Stealth para extraer enlace...');

      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Configurar como navegador real
      await page.setViewport({ width: 1920, height: 1080 });

      let capturedUrl = null;

      // Interceptar requests de video
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const url = request.url();
        const resourceType = request.resourceType();

        // Bloquear solo elementos muy pesados o innecesarios que no afecten la detección
        if (resourceType === 'image' || resourceType === 'font') {
          request.abort();
          return;
        }

        // Capturar URLs de video
        if (url.includes('.m3u8') || url.includes('.mp4') ||
          url.includes('master.m3u8') || url.includes('playlist.m3u8')) {
          console.log('🎬 URL de video interceptada:', url);
          capturedUrl = url;
        }

        request.continue();
      });

      // Navegar a la página
      await page.goto(sourceUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 25000
      });

      // Simulaciones humanas simples
      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.up();

      // Intentar encontrar el video rápidamente
      if (!capturedUrl) {
        try {
          await page.waitForSelector('video', { timeout: 5000 });
        } catch (e) { /* Ignorar timeout */ }
      }

      // Buscar botones de play y hacer clic si no se ha capturado nada
      if (!capturedUrl) {
        try {
          const playSelectors = ['.play-button', '.btn-play', '[data-play]', 'button[onclick*="play"]', '.video-play'];
          for (const selector of playSelectors) {
            const button = await page.$(selector);
            if (button) {
              console.log(`🎮 Clickeando ${selector}`);
              await button.click();
              await new Promise(r => setTimeout(r, 1000));
              break;
            }
          }
        } catch (e) {
          console.log('⚠️ Error intentando clickear play:', e.message);
        }
      }

      // Último intento: escanear el DOM
      if (!capturedUrl) {
        capturedUrl = await page.evaluate(() => {
          const videos = document.querySelectorAll('video');
          for (const v of videos) {
            if (v.src && (v.src.includes('blob:') || v.src.includes('.mp4') || v.src.includes('.m3u8'))) return v.src;
          }
          // Scan scripts
          const scripts = document.querySelectorAll('script');
          for (const s of scripts) {
            if (s.innerText.includes('.m3u8')) {
              const match = s.innerText.match(/["'](http[^"']+\.m3u8[^"']*)["']/);
              if (match) return match[1];
            }
          }
          return null;
        });
      }

      await page.close();
      return capturedUrl;

    } catch (error) {
      console.error('❌ Error con Puppeteer:', error);
      if (page) await page.close().catch(() => { });
      return null;
    }
  }

  async extractWithAxios(sourceUrl) {
    try {
      console.log('📡 Usando método simple con Axios...');

      const response = await axios.get(sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': sourceUrl
        },
        timeout: 8000
      });

      const html = response.data;

      const patterns = [
        /file['"]\s*:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i,
        /source['"]\s*:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i,
        /src['"]\s*:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i,
        /"(https?:\/\/[^"]+\.m3u8[^"]*)"/i
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const url = match[1];
          if (!url.includes('ad') && url.startsWith('http')) return url;
        }
      }

      return null;
    } catch (error) {
      // console.error('❌ Error con Axios:', error.message);
      return null;
    }
  }

  isValidStreamUrl(url) {
    return url && (url.includes('.m3u8') || url.includes('.mp4') || url.includes('blob:'));
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) this.cache.delete(key);
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

module.exports = new AdvancedLinkGenerator();