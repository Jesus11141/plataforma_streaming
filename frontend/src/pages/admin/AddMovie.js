import React, { useState } from 'react';
import { createMovie } from '../../services/api';

const AddMovie = () => {
  const [movie, setMovie] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    genre: [],
    poster: '',
    m3u8Url: '',
    quality: '1080p'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Limpiar URL final antes de enviar
      let cleanUrl = movie.m3u8Url;
      const iframeMatch = cleanUrl.match(/src=["'](.*?)["']/i);
      if (iframeMatch) {
        cleanUrl = iframeMatch[1];
      }
      
      const movieData = {
        title: movie.title,
        description: movie.description,
        year: movie.year,
        genre: movie.genre,
        poster: movie.poster,
        streams: [{
          quality: movie.quality,
          url: cleanUrl,
          server: 'servidor1',
          active: true
        }]
      };
      
      console.log('📤 Enviando datos:', movieData);
      
      await createMovie(movieData);
      setMessage('Película agregada exitosamente');
      setMovie({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        genre: [],
        poster: '',
        m3u8Url: '',
        quality: '1080p'
      });
    } catch (error) {
      console.error('💥 Error frontend:', error);
      setMessage('Error al agregar película: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (genre) => {
    setMovie(prev => ({
      ...prev,
      genre: prev.genre.includes(genre) 
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const genres = ['Acción', 'Aventura', 'Animación', 'Comedia', 'Drama', 'Fantasía', 'Horror', 'Romance', 'Ciencia Ficción', 'Thriller'];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Agregar Nueva Película</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-600' : 'bg-green-600'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título</label>
          <input
            type="text"
            value={movie.title}
            onChange={(e) => setMovie({...movie, title: e.target.value})}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            value={movie.description}
            onChange={(e) => setMovie({...movie, description: e.target.value})}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Año</label>
            <input
              type="number"
              value={movie.year}
              onChange={(e) => setMovie({...movie, year: parseInt(e.target.value)})}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Calidad</label>
            <select
              value={movie.quality}
              onChange={(e) => setMovie({...movie, quality: e.target.value})}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            >
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4K">4K</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL del Poster</label>
          <input
            type="url"
            value={movie.poster}
            onChange={(e) => setMovie({...movie, poster: e.target.value})}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL del Video</label>
          <input
            type="text"
            value={movie.m3u8Url}
            onChange={(e) => {
              let url = e.target.value;
              
              // Extraer URL de iframe si se pega código HTML
              const iframeMatch = url.match(/src=["'](.*?)["']/i);
              if (iframeMatch) {
                url = iframeMatch[1];
              }
              
              // Convertir Streamtape /v/ a /e/ simple
              if (url.includes('streamtape.com/v/')) {
                const videoId = url.match(/\/v\/([^/]+)/)?.[1];
                if (videoId) {
                  url = `https://streamtape.com/e/${videoId}`;
                }
              }
              
              // Convertir Bysekoze /v/ a /e/
              if (url.includes('bysekoze.com/v/')) {
                const videoId = url.match(/\/v\/([^/]+)/)?.[1];
                if (videoId) {
                  url = `https://bysekoze.com/e/${videoId}`;
                }
              }
              
              setMovie({...movie, m3u8Url: url});
            }}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            placeholder="Pega cualquier URL de video o código iframe"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 Soporta: Streamtape, M3U8, MP4, iframes. Se convierte automáticamente.
          </p>
          {movie.m3u8Url && (
            <div className="text-xs mt-1">
              {movie.m3u8Url.includes('streamtape.com') && (
                <p className="text-green-400">
                  ✅ Streamtape detectado - Usará embedplayer
                </p>
              )}
              {movie.m3u8Url.includes('bysekoze.com') && (
                <p className="text-blue-400">
                  ✅ Bysekoze detectado - Formato embed
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Géneros</label>
          <div className="grid grid-cols-3 gap-2">
            {genres.map(genre => (
              <label key={genre} className="flex items-center">
                <input
                  type="checkbox"
                  checked={movie.genre.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                  className="mr-2"
                />
                <span className="text-sm">{genre}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-medium"
        >
          {loading ? 'Agregando...' : 'Agregar Película'}
        </button>
      </form>
    </div>
  );
};

export default AddMovie;