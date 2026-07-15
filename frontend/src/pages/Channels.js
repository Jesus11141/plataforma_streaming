import React, { useState, useEffect } from 'react';
import { getChannels } from '../services/api';
import { Link } from 'react-router-dom';

const RADIO_CATEGORIES = ['radio', 'music', 'música'];
const isRadio = (cat) => RADIO_CATEGORIES.some(r => cat?.toLowerCase().includes(r));

const Channels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    getChannels({}).then(data => {
      // Solo canales de TV, sin radio
      setChannels(data.filter(c => !isRadio(c.category)));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['Todos', ...new Set(channels.map(c => c.category).filter(Boolean))];

  const filtered = channels.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Todos' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-stream-blue"></div>
    </div>
  );

  return (
    <div className="pb-10 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f18] to-black">
      {/* Hero Elegante */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/90 border-b border-gray-800 px-6 py-16 mb-10 text-center shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-stream-blue/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight drop-shadow-lg">
            TV <span className="text-stream-blue">Premium</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium mb-8 tracking-wide">La mejor televisión en vivo con calidad HD.</p>
          
          {/* Buscador de cristal */}
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-stream-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar canal o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-stream-blue/50 focus:border-stream-blue/50 text-white shadow-inner transition-all text-lg font-medium placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Categorías Elegantes */}
      <div className="flex gap-3 px-6 lg:px-12 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 transform active:scale-95 shadow-lg backdrop-blur-sm ${
              activeCategory === cat 
                ? 'bg-gradient-to-r from-stream-blue to-blue-600 text-white shadow-blue-500/30 border border-stream-blue/20' 
                : 'bg-gray-800/60 hover:bg-gray-700 text-gray-300 border border-gray-700/50 hover:border-gray-500/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Tarjetas Premium */}
      <div className="px-6 lg:px-12">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filtered.map(channel => (
              <Link
                key={channel.id}
                to={`/player/channel/${channel.id}`}
                className="group relative bg-gray-900/40 backdrop-blur-lg border border-gray-800 hover:border-gray-600 rounded-3xl p-5 flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden"
              >
                {/* Fondo Resplandor Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-stream-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {/* Contenedor del Logo (Estilo Neumórfico/Cristal - Cuadrado Relajado para TV) */}
                <div className="relative w-full aspect-video rounded-xl flex items-center justify-center p-1 border border-gray-700/50 shadow-inner group-hover:shadow-[0_0_20px_rgba(0,51,160,0.2)] bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500">
                  {channel.logo ? (
                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain rounded-lg bg-black/50 p-2 transform group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center text-4xl transform group-hover:scale-105 transition-transform duration-500 shadow-inner">📺</div>
                  )}
                  {/* Indicador Play flotante al hover */}
                  <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="text-center w-full relative z-10 flex flex-col items-center">
                  <h3 className="text-base font-bold text-gray-100 truncate w-full group-hover:text-blue-400 transition-colors drop-shadow-sm">{channel.name}</h3>
                  <div className="mt-1">
                    <span className="text-[10px] font-semibold text-gray-300 bg-gray-800/80 border border-gray-700 px-2 py-0.5 rounded-md truncate max-w-full inline-block">
                      {channel.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-900/30 backdrop-blur-sm rounded-3xl border border-gray-800 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-700 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-2xl font-bold text-gray-300 mb-3 tracking-tight">No hay canales disponibles</p>
            <p className="text-gray-500 mb-8 max-w-md">Prueba otra búsqueda o añade canales para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channels;