import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies, updateMovie } from '../../services/api';

const AddEpisode = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [newEpisode, setNewEpisode] = useState({
    season: 1,
    episode_number: 1,
    title: '',
    m3u8Url: '',
    quality: '1080p'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      const data = await getMovies();
      const seriesOnly = data.filter(item => item.type === 'series');
      setSeries(seriesOnly);
    } catch (error) {
      setMessage('Error cargando series: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesSelect = (seriesItem) => {
    setSelectedSeries(seriesItem);
    
    // Calcular siguiente número de episodio
    const seasons = {};
    
    if (seriesItem.streams && seriesItem.streams.length > 0) {
      seriesItem.streams.forEach(stream => {
        const season = stream.season || 1;
        const episode = stream.episode || 1;
        
        if (!seasons[season]) seasons[season] = [];
        seasons[season].push(episode);
      });
      
      if (Object.keys(seasons).length > 0) {
        const maxSeason = Math.max(...Object.keys(seasons).map(Number));
        const maxEpisode = Math.max(...seasons[maxSeason]);
        
        setNewEpisode({
          season: maxSeason,
          episode_number: maxEpisode + 1,
          title: '',
          m3u8Url: '',
          quality: '1080p'
        });
      } else {
        // Si no hay episodios, empezar con T1E1
        setNewEpisode({
          season: 1,
          episode_number: 1,
          title: '',
          m3u8Url: '',
          quality: '1080p'
        });
      }
    } else {
      // Si no hay streams, empezar con T1E1
      setNewEpisode({
        season: 1,
        episode_number: 1,
        title: '',
        m3u8Url: '',
        quality: '1080p'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updatedStreams = [
        ...selectedSeries.streams,
        {
          season: newEpisode.season,
          episode: newEpisode.episode_number,
          episode_title: newEpisode.title,
          quality: newEpisode.quality,
          url: newEpisode.m3u8Url,
          server: 'servidor1',
          active: true
        }
      ];

      const seriesData = {
        ...selectedSeries,
        streams: updatedStreams
      };
      
      await updateMovie(selectedSeries.id, seriesData);
      setMessage('Episodio agregado exitosamente');
      
      // Reset form
      setNewEpisode({
        season: newEpisode.season,
        episode_number: newEpisode.episode_number + 1,
        title: '',
        m3u8Url: '',
        quality: '1080p'
      });
      
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (error) {
      setMessage('Error al agregar episodio: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const getSeriesInfo = (seriesItem) => {
    const seasons = {};
    let totalEpisodes = 0;
    
    if (seriesItem.streams && seriesItem.streams.length > 0) {
      seriesItem.streams.forEach(stream => {
        const season = stream.season || 1;
        if (!seasons[season]) seasons[season] = 0;
        seasons[season]++;
        totalEpisodes++;
      });
    }
    
    const totalSeasons = Object.keys(seasons).length || 0;
    
    return { totalSeasons, totalEpisodes };
  };

  if (loading) return <div className="p-8 text-white">Cargando series...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Agregar Episodio a Serie</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-600' : 'bg-green-600'}`}>
          {message}
        </div>
      )}

      {!selectedSeries ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">Selecciona una Serie:</h3>
          
          {series.length === 0 ? (
            <p className="text-gray-400">No hay series disponibles. Crea una serie primero.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {series.map(seriesItem => {
                const { totalSeasons, totalEpisodes } = getSeriesInfo(seriesItem);
                
                return (
                  <div
                    key={seriesItem.id}
                    onClick={() => handleSeriesSelect(seriesItem)}
                    className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={seriesItem.poster || 'https://via.placeholder.com/80x120/374151/9CA3AF?text=Sin+Imagen'}
                        alt={seriesItem.title}
                        className="w-16 h-24 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x120/374151/9CA3AF?text=Sin+Imagen';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{seriesItem.title}</h4>
                        <p className="text-gray-400 text-sm">{seriesItem.year}</p>
                        <p className="text-gray-300 text-sm">
                          {totalSeasons} temporada{totalSeasons !== 1 ? 's' : ''} • {totalEpisodes} episodio{totalEpisodes !== 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {seriesItem.genre.slice(0, 2).map(g => (
                            <span key={g} className="bg-gray-600 px-2 py-1 rounded text-xs">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              <img
                src={selectedSeries.poster || 'https://via.placeholder.com/80x120/374151/9CA3AF?text=Sin+Imagen'}
                alt={selectedSeries.title}
                className="w-16 h-24 object-cover rounded"
              />
              <div>
                <h3 className="text-xl font-semibold">{selectedSeries.title}</h3>
                <p className="text-gray-400">{selectedSeries.year}</p>
              </div>
              <button
                onClick={() => setSelectedSeries(null)}
                className="ml-auto bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm"
              >
                Cambiar Serie
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">Nuevo Episodio:</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Temporada</label>
                <input
                  type="number"
                  min="1"
                  value={newEpisode.season}
                  onChange={(e) => setNewEpisode({...newEpisode, season: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Número de Episodio</label>
                <input
                  type="number"
                  min="1"
                  value={newEpisode.episode_number}
                  onChange={(e) => setNewEpisode({...newEpisode, episode_number: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Título del Episodio</label>
              <input
                type="text"
                value={newEpisode.title}
                onChange={(e) => setNewEpisode({...newEpisode, title: e.target.value})}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                placeholder="Título del episodio (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL M3U8</label>
              <input
                type="url"
                value={newEpisode.m3u8Url}
                onChange={(e) => setNewEpisode({...newEpisode, m3u8Url: e.target.value})}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Calidad</label>
              <select
                value={newEpisode.quality}
                onChange={(e) => setNewEpisode({...newEpisode, quality: e.target.value})}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              >
                <option value="480p">480p</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-3 rounded font-medium"
              >
                {saving ? 'Agregando...' : 'Agregar Episodio'}
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
      )}
    </div>
  );
};

export default AddEpisode;