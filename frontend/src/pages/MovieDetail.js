import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovie } from '../services/api';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    try {
      const data = await getMovie(id);
      setMovie(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!movie) return <div className="p-8">Película no encontrada</div>;

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row gap-8">
        <img 
          src={movie.poster || '/placeholder.jpg'} 
          alt={movie.title}
          className="w-full md:w-80 h-auto rounded-lg"
        />
        
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <p className="text-gray-300 mb-4">{movie.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-gray-400">Año:</span> {movie.year}
            </div>
            <div>
              <span className="text-gray-400">Duración:</span> {movie.duration || 'N/A'} min
            </div>
            <div>
              <span className="text-gray-400">País:</span> {movie.country || 'N/A'}
            </div>
            <div>
              <span className="text-gray-400">Idioma:</span> {movie.language || 'N/A'}
            </div>
          </div>
          
          <div className="mb-6">
            <span className="text-gray-400">Géneros:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {movie.genre.map(g => (
                <span key={g} className="bg-gray-700 px-3 py-1 rounded">
                  {g}
                </span>
              ))}
            </div>
          </div>
          
          <Link 
            to={`/player/${movie.id}`}
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold inline-block"
          >
            ▶ Reproducir
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;