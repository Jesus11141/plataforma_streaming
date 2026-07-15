import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChannels } from '../services/api';

const MOVIE_CATEGORIES = ['movies', 'films', 'peliculas', 'películas', 'cine', 'series', 'vod'];
const RADIO_CATEGORIES = ['radio', 'music', 'música'];

const isMovie = (cat) => MOVIE_CATEGORIES.some(m => cat?.toLowerCase().includes(m));
const isRadio = (cat) => RADIO_CATEGORIES.some(r => cat?.toLowerCase().includes(r));

const Home = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('tv');

  useEffect(() => {
    getChannels({}).then(setChannels).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const tvChannels = filtered.filter(c => !isMovie(c.category) && !isRadio(c.category));
  const radioChannels = filtered.filter(c => isRadio(c.category));
  const movieChannels = filtered.filter(c => isMovie(c.category));

  const tvCategories = ['Todos', ...new Set(tvChannels.map(c => c.category).filter(Boolean))];
  const [tvFilter, setTvFilter] = useState('Todos');

  const filteredTv = tvFilter === 'Todos' ? tvChannels : tvChannels.filter(c => c.category === tvFilter);

  const tabs = [
    { id: 'tv', label: '📺 TV en Vivo', count: tvChannels.length },
    { id: 'movies', label: '🎬 Cine y Series', count: movieChannels.length },
    { id: 'radio', label: '📻 Estaciones', count: radioChannels.length },
  ];

  const Card = ({ item }) => {
    const isVid = isMovie(item.category) || (!isRadio(item.category) && !isMovie(item.category));
    return (
      <Link
        to={`/player/channel/${item.id}`}
        className="group relative bg-gray-900/40 backdrop-blur-lg border border-gray-800 hover:border-gray-600 rounded-3xl p-5 flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stream-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        {/* Contenedor Premium Icon/Logo */}
        <div className={`relative ${isVid ? 'w-full aspect-video rounded-xl' : 'w-24 h-24 rounded-full'} flex items-center justify-center p-1 border border-gray-700/50 shadow-inner group-hover:shadow-[0_0_20px_rgba(0,51,160,0.2)] bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500`}>
          {!isVid && <div className="absolute inset-0 rounded-full border border-gray-600/30"></div>}
          {item.logo ? (
            <img
              src={item.logo}
              alt={item.name}
              className={`w-full h-full ${isVid ? 'object-contain rounded-lg bg-black/50 p-2' : 'object-cover rounded-full bg-black/50 p-1'} transform group-hover:scale-105 transition-transform duration-500`}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-4xl shadow-inner ${isVid ? 'rounded-lg' : 'rounded-full'} transform group-hover:scale-105 transition-transform duration-500`}>
              {isRadio(item.category) ? '📻' : isMovie(item.category) ? '🎬' : '📺'}
            </div>
          )}
          {/* Indicador Play Play al hover */}
          <div className={`absolute inset-0 bg-black/50 ${isVid ? 'rounded-xl' : 'rounded-full'} opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white translate-x-0.5 drop-shadow-md" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="text-center w-full relative z-10 flex flex-col items-center">
          <h3 className="text-base font-bold text-gray-100 truncate w-full group-hover:text-blue-400 transition-colors drop-shadow-sm">{item.name}</h3>
          <div className="mt-1 flex gap-2 justify-center w-full">
            <span className="text-[10px] font-semibold text-gray-300 bg-gray-800/80 border border-gray-700 px-2 py-0.5 rounded-md truncate max-w-full">
              {item.category || 'Varios'}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#050505]">
      <div className="relative">
        <div className="absolute inset-0 bg-stream-blue rounded-full blur-[30px] opacity-20"></div>
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-stream-blue relative z-10"></div>
      </div>
    </div>
  );

  return (
    <div className="pb-12 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f18] to-black">
      {/* Hero Interactivo y Buscador */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#0a0f18] to-black border-b border-gray-800/80 px-6 py-20 mb-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-full bg-stream-blue/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <img 
            src="https://congreso.unibe.edu.ec/wp-content/uploads/2023/03/logo-unibe-color.png" 
            alt="UNIBE" 
            className="h-16 md:h-20 w-auto mx-auto mb-4 object-contain"
          />
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-stream-blue via-white to-gray-400 tracking-tight drop-shadow-lg">
            UNIBE <span className="text-white">Media</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide">
            Explora el mejor contenido en un solo lugar.
          </p>
          
          <div className="relative max-w-2xl mx-auto group mt-8">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-focus-within:text-stream-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar películas, TV o estaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 md:py-5 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-stream-blue/50 focus:border-stream-blue/50 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all text-lg font-medium placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs Premium */}
      <div className="flex gap-3 px-6 lg:px-12 mb-8 overflow-x-auto pb-4 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-2xl text-sm md:text-base font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95 shadow-lg backdrop-blur-sm tracking-wide ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-stream-blue to-blue-600 text-white shadow-[0_0_20px_rgba(0,51,160,0.3)] border border-stream-blue/20' 
                : 'bg-gray-800/60 hover:bg-gray-700 text-gray-300 border border-gray-700/50 hover:border-gray-500/50'
            }`}
          >
            {tab.label} <span className={`ml-2 px-2 py-0.5 rounded-md text-xs ${activeTab === tab.id ? 'bg-blue-800/50' : 'bg-gray-900/50'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Filtro de subcategorías TV */}
      <div className={`transition-all duration-300 overflow-hidden ${activeTab === 'tv' ? 'max-h-24 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="flex gap-2 px-6 lg:px-12 overflow-x-auto pb-2 scrollbar-hide">
          {tvCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setTvFilter(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border shadow-sm ${
                tvFilter === cat 
                  ? 'bg-gray-200 text-gray-900 border-white' 
                  : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Contenidos Premium */}
      <div className="px-6 lg:px-12">
        {activeTab === 'tv' && (
          filteredTv.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {filteredTv.map(c => <Card key={c.id} item={c} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 font-medium">No se encontraron canales de TV.</div>
          )
        )}

        {activeTab === 'movies' && (
          movieChannels.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movieChannels.map(c => <Card key={c.id} item={c} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 font-medium">No hay películas que coincidan con la búsqueda.</div>
          )
        )}

        {activeTab === 'radio' && (
          radioChannels.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {radioChannels.map(c => <Card key={c.id} item={c} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 font-medium">No se encontraron estaciones de radio.</div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
