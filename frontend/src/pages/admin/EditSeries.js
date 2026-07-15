import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovie, updateMovie } from '../../services/api';

const EditSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSeries();
  }, [id]);

  const loadSeries = async () => {
    try {
      const data = await getMovie(id);
      
      // Convertir streams a formato de temporadas/episodios
      const seasons = {};
      data.streams.forEach(stream => {
        if (!seasons[stream.season]) {
          seasons[stream.season] = { season_number: stream.season, episodes: [] };
        }
        seasons[stream.season].episodes.push({
          episode_number: stream.episode,
          title: stream.episode_title || '',
          m3u8Url: stream.url,
          quality: stream.quality
        });
      });

      setSeries({
        ...data,
        seasons: Object.values(seasons).sort((a, b) => a.season_number - b.season_number)
      });
    } catch (error) {
      setMessage('Error cargando serie: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addSeason = () => {
    setSeries(prev => ({
      ...prev,
      seasons: [...prev.seasons, {
        season_number: prev.seasons.length + 1,
        episodes: [{ episode_number: 1, title: '', m3u8Url: '', quality: '1080p' }]
      }]
    }));
  };

  const addEpisode = (seasonIndex) => {
    setSeries(prev => {
      const newSeasons = [...prev.seasons];
      newSeasons[seasonIndex].episodes.push({
        episode_number: newSeasons[seasonIndex].episodes.length + 1,
        title: '',
        m3u8Url: '',
        quality: '1080p'
      });
      return { ...prev, seasons: newSeasons };
    });
  };

  const removeEpisode = (seasonIndex, episodeIndex) => {
    setSeries(prev => {
      const newSeasons = [...prev.seasons];
      newSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
      return { ...prev, seasons: newSeasons };
    });
  };

  const updateEpisode = (seasonIndex, episodeIndex, field, value) => {
    setSeries(prev => {
      const newSeasons = [...prev.seasons];
      newSeasons[seasonIndex].episodes[episodeIndex][field] = value;
      return { ...prev, seasons: newSeasons };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const seriesData = {
        title: series.title,
        description: series.description,
        year: series.year,
        genre: series.genre,
        poster: series.poster,
        type: 'series',
        streams: series.seasons.flatMap(season => 
          season.episodes.map(episode => ({
            season: season.season_number,
            episode: episode.episode_number,
            episode_title: episode.title,
            quality: episode.quality,
            url: episode.m3u8Url,
            server: 'servidor1',
            active: true
          }))
        )
      };
      
      await updateMovie(id, seriesData);
      setMessage('Serie actualizada exitosamente');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (error) {
      setMessage('Error al actualizar serie: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleGenreChange = (genre) => {
    setSeries(prev => ({
      ...prev,
      genre: prev.genre.includes(genre) 
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const genres = ['Acción', 'Aventura', 'Animación', 'Comedia', 'Drama', 'Fantasía', 'Horror', 'Romance', 'Ciencia Ficción', 'Thriller'];

  if (loading) return <div className="p-8 text-white">Cargando...</div>;
  if (!series) return <div className="p-8 text-white">Serie no encontrada</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Editar Serie: {series.title}</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${message.includes('Error') ? 'bg-red-600' : 'bg-green-600'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título de la Serie</label>
            <input
              type="text"
              value={series.title}
              onChange={(e) => setSeries({...series, title: e.target.value})}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Año</label>
            <input
              type="number"
              value={series.year}
              onChange={(e) => setSeries({...series, year: parseInt(e.target.value)})}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            value={series.description}
            onChange={(e) => setSeries({...series, description: e.target.value})}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">URL del Poster</label>
          <input
            type="url"
            value={series.poster}
            onChange={(e) => setSeries({...series, poster: e.target.value})}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Géneros</label>
          <div className="grid grid-cols-3 gap-2">
            {genres.map(genre => (
              <label key={genre} className="flex items-center">
                <input
                  type="checkbox"
                  checked={series.genre.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                  className="mr-2"
                />
                <span className="text-sm">{genre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Temporadas y Episodios */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Temporadas y Episodios</h3>
            <button
              type="button"
              onClick={addSeason}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              + Temporada
            </button>
          </div>

          {series.seasons.map((season, seasonIndex) => (
            <div key={seasonIndex} className="bg-gray-700 p-4 rounded mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-medium">Temporada {season.season_number}</h4>
                <button
                  type="button"
                  onClick={() => addEpisode(seasonIndex)}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                >
                  + Episodio
                </button>
              </div>

              {season.episodes.map((episode, episodeIndex) => (
                <div key={episodeIndex} className="bg-gray-600 p-3 rounded mb-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs mb-1">Número Episodio</label>
                      <input
                        type="number"
                        min="1"
                        value={episode.episode_number}
                        onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'episode_number', parseInt(e.target.value))}
                        className="w-full p-2 bg-gray-800 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Título del episodio</label>
                      <input
                        type="text"
                        placeholder="Título del episodio"
                        value={episode.title}
                        onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'title', e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">URL M3U8</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={episode.m3u8Url}
                        onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'm3u8Url', e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded text-sm"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={episode.quality}
                        onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'quality', e.target.value)}
                        className="flex-1 p-2 bg-gray-800 rounded text-sm"
                      >
                        <option value="480p">480p</option>
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="4K">4K</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
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

export default EditSeries;