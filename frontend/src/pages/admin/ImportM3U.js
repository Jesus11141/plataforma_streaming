import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const ImportM3U = () => {
  const [m3uUrl, setM3uUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const handleImport = async () => {
    if (!m3uUrl.trim()) return;
    setLoading(true);
    setMessage('⏳ Importando lista, esto puede tardar unos minutos...');
    setResult(null);
    try {
      const res = await axios.post(`${API}/channels/import-m3u`, {
        url: m3uUrl,
        listName: m3uUrl
      }, { timeout: 300000 });
      setResult(res.data);
      setMessage(`✅ Importados ${res.data.inserted} de ${res.data.total} canales`);
      setM3uUrl('');
    } catch (error) {
      setMessage('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const suggested = [
    { name: '🌍 Todos los canales (8000+)', url: 'https://iptv-org.github.io/iptv/index.m3u' },
    { name: '🇲🇽 México', url: 'https://iptv-org.github.io/iptv/countries/mx.m3u' },
    { name: '🇦🇷 Argentina', url: 'https://iptv-org.github.io/iptv/countries/ar.m3u' },
    { name: '🇨🇴 Colombia', url: 'https://iptv-org.github.io/iptv/countries/co.m3u' },
    { name: '🇪🇸 España', url: 'https://iptv-org.github.io/iptv/countries/es.m3u' },
    { name: '🇺🇸 Estados Unidos', url: 'https://iptv-org.github.io/iptv/countries/us.m3u' },
    { name: '📰 Noticias', url: 'https://iptv-org.github.io/iptv/categories/news.m3u' },
    { name: '⚽ Deportes', url: 'https://iptv-org.github.io/iptv/categories/sports.m3u' },
    { name: '🎬 Películas', url: 'https://iptv-org.github.io/iptv/categories/movies.m3u' },
    { name: '🎵 Música', url: 'https://iptv-org.github.io/iptv/categories/music.m3u' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">📋 Importar Lista M3U</h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-3 text-lg">🔗 URL de la lista</h3>
        <p className="text-gray-400 text-sm mb-4">La importación se hace en el servidor. Soporta miles de canales.</p>
        <input
          type="text"
          value={m3uUrl}
          onChange={(e) => setM3uUrl(e.target.value)}
          placeholder="https://iptv-org.github.io/iptv/index.m3u"
          className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-red-500 mb-3"
        />
        <button
          onClick={handleImport}
          disabled={loading || !m3uUrl.trim()}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded font-bold text-lg"
        >
          {loading ? '⏳ Importando...' : '🚀 Importar Lista Completa'}
        </button>
      </div>

      {/* Listas sugeridas */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="font-semibold mb-3">⭐ Listas recomendadas</h3>
        <div className="space-y-2">
          {suggested.map(item => (
            <button
              key={item.url}
              onClick={() => setM3uUrl(item.url)}
              className="w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje */}
      {message && (
        <div className={`p-4 rounded mb-4 ${message.includes('❌') ? 'bg-red-900' : message.includes('⏳') ? 'bg-yellow-900' : 'bg-green-900'}`}>
          {message}
          {loading && (
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full animate-pulse w-full" />
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-green-400 font-bold">✅ Importación completada</p>
          <p className="text-gray-300">Total encontrados: {result.total}</p>
          <p className="text-gray-300">Insertados: {result.inserted}</p>
        </div>
      )}
    </div>
  );
};

export default ImportM3U;
