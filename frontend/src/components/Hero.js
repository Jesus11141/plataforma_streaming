import React from 'react';
import { Link } from 'react-router-dom';

const Hero = ({ movie }) => {
  if (!movie) return null;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] mb-12 overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-60 transform scale-105"
          onError={(e) => {
             e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1925&q=80';
          }}
        />
        {/* Gradient Overlay Premium */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent"></div>
        {/* Ambient Azul Sutil */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-stream-blue/10 blur-[100px] pointer-events-none"></div>
      </div>

      <div className="relative h-full container mx-auto px-6 md:px-12 flex flex-col justify-end pb-24 z-10 animate-fade-in">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-4 mb-5">
            <span className="px-3.5 py-1.5 bg-stream-blue/20 text-blue-400 text-xs font-bold rounded-md border border-stream-blue/30 backdrop-blur-md uppercase tracking-wider shadow-[0_0_15px_rgba(0,51,160,0.2)]">
              {movie.type === 'series' ? 'SERIE' : 'PELÍCULA'}
            </span>
            <span className="text-gray-300 text-sm font-semibold tracking-wide bg-gray-900/50 px-3 py-1 rounded-md border border-gray-700/50 backdrop-blur-sm">{movie.year}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 leading-tight tracking-tight drop-shadow-lg">
            {movie.title}
          </h1>
          
          <p className="text-gray-300 md:text-gray-400 text-lg md:text-xl font-medium mb-8 line-clamp-3 leading-relaxed max-w-2xl drop-shadow-md">
            {movie.description || 'Una emocionante historia llena de acción, drama y aventuras. No te pierdas esta increíble entrega directamente en RaulFlix Premium.'}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              to={`/movie/${movie.id}`}
              className="group px-8 py-3.5 bg-gradient-to-r from-stream-blue to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_10px_25px_rgba(0,51,160,0.4)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Reproducir Ahora
            </Link>
            
            <button className="px-8 py-3.5 bg-gray-800/60 hover:bg-gray-700/80 text-white font-semibold rounded-xl backdrop-blur-md transition-all duration-300 border border-gray-600/50 hover:border-gray-400 flex items-center gap-2 shadow-lg active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Más información
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
