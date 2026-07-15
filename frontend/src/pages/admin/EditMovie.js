import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovie, updateMovie } from '../../services/api';

const EditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [servers, setServers] = useState([]);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    try {
      const data = await getMovie(id);
      console.log('Película cargada:', data);
      console.log('Streams existentes:', data.streams);
      setMovie(data);
      
      // Cargar servidores existentes
      if (data.streams && data.streams.length > 0) {
        console.log('Cargando servidores existentes:', data.streams);
        setServers(data.streams);
      } else {
        console.log('No hay servidores, creando uno por defecto');
        setServers([{
          url: '',
          server: 'Servidor 1',
          quality: '1080p',
          active: true
        }]);
      }
    } catch (error) {
      setMessage('Error cargando película: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const movieData = {
        title: movie.title,
        description: movie.description,
        year: movie.year,
        genre: movie.genre,
        poster: movie.poster,
        type: 'movie',
        streams: servers.filter(server => server.url.trim() !== '')
      };
      
      await updateMovie(id, movieData);
      setMessage('Película actualizada exitosamente');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (error) {
      setMessage('Error al actualizar película: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const addServer = () => {
    setServers([...servers, {
      url: '',
      server: `Servidor ${servers.length + 1}`,
      quality: '1080p',
      active: true
    }]);
  };

  const removeServer = (index) => {
    if (servers.length > 1) {
      setServers(servers.filter((_, i) => i !== index));
    }
  };

  const updateServer = (index, field, value) => {
    const newServers = [...servers];
    newServers[index][field] = value;
    setServers(newServers);
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

  if (loading) return <div className="p-8 text-white">Cargando...</div>;
  if (!movie) return <div className="p-8 text-white">Película no encontrada</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Editar Película: {movie.title}</h2>
      
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
            value={movie.description || ''}
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
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL del Poster</label>
          <input
            type="url"
            value={movie.poster || ''}
            onChange={(e) => setMovie({...movie, poster: e.target.value})}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Servidores de Streaming</label>
            <button
              type="button"
              onClick={addServer}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              + Agregar Servidor
            </button>
          </div>
          
          {servers.map((server, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-700 rounded border">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Servidor {index + 1}</h4>
                {servers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeServer(index)}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs mb-1">Nombre del Servidor</label>
                  <input
                    type="text"
                    value={server.server}
                    onChange={(e) => updateServer(index, 'server', e.target.value)}
                    className="w-full p-2 bg-gray-600 rounded border border-gray-500 text-sm"
                    placeholder="Servidor 1"
                  />
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Calidad</label>
                  <select
                    value={server.quality}
                    onChange={(e) => updateServer(index, 'quality', e.target.value)}
                    className="w-full p-2 bg-gray-600 rounded border border-gray-500 text-sm"
                  >
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Estado</label>
                  <select
                    value={server.active}
                    onChange={(e) => updateServer(index, 'active', e.target.value === 'true')}
                    className="w-full p-2 bg-gray-600 rounded border border-gray-500 text-sm"
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-2">
                <label className="block text-xs mb-1">URL del Video</label>
                <input
                  type="url"
                  value={server.url}
                  onChange={(e) => updateServer(index, 'url', e.target.value)}
                  className="w-full p-2 bg-gray-600 rounded border border-gray-500 text-sm"
                  placeholder="https://servidor.com/video.mp4"
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Géneros</label>
          <div className="grid grid-cols-3 gap-2">
            {genres.map(genre => (
              <label key={genre} className="flex items-center">
                <input
                  type="checkbox"
                  checked={movie.genre?.includes(genre) || false}
                  onChange={() => handleGenreChange(genre)}
                  className="mr-2"
                />
                <span className="text-sm">{genre}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded font-medium"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-6 bg-gray-600 hover:bg-gray-700 p-3 rounded font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMovie;