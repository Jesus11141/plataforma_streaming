import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovie } from '../services/api';
import VideoFrame from '../components/VideoFrame';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const Player = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    loadMovie();
  }, [id]);

  // useEffect para inicializar video cuando cambie streamUrl
  useEffect(() => {
    if (streamUrl && videoRef.current) {
      console.log('🎬 [DEBUG] useEffect detectó streamUrl:', streamUrl);
      setTimeout(() => {
        console.log('🎬 [DEBUG] Llamando loadVideo desde useEffect');
        loadVideo(streamUrl);
      }, 1000);
    }
  }, [streamUrl]);

  const loadMovie = async () => {
    try {
      console.log('🎬 [DEBUG] Cargando contenido ID:', id);
      const movieData = await getMovie(id);
      console.log('📽️ [DEBUG] Contenido cargado:', movieData);
      console.log('📽️ [DEBUG] Streams disponibles:', movieData.streams);
      setMovie(movieData);
      
      if (movieData.streams && movieData.streams.length > 0) {
        console.log('📽️ [DEBUG] Tipo de contenido:', movieData.type);
        // Si es serie, mostrar episodios sin reproducir
        if (movieData.type === 'series') {
          console.log('📺 [DEBUG] Es serie, mostrando episodios');
          setShowEpisodes(true);
        } else {
          console.log('🎬 [DEBUG] Es película, cargando automáticamente');
          console.log('🎬 [DEBUG] Streams disponibles:', movieData.streams.length);
          // Si es película, cargar primer servidor automáticamente
          setSelectedServer(0);
          autoGenerateAndPlay(movieData.streams[0]);
        }
      } else {
        console.log('❌ [DEBUG] No hay streams disponibles');
        setLinkError('No hay streams disponibles para este contenido');
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error cargando contenido:', error);
      setLinkError('Error cargando contenido: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadVideo = (videoSrc) => {
    console.log('🎥 [DEBUG] loadVideo llamado con:', videoSrc);
    console.log('🎥 [DEBUG] videoRef.current existe:', !!videoRef.current);
    
    if (playerRef.current) {
      console.log('🎥 [DEBUG] Disposing previous player');
      playerRef.current.dispose();
      playerRef.current = null;
    }
    
    if (videoRef.current) {
      console.log('🎥 [DEBUG] Inicializando nuevo player');
      
      const videoType = videoSrc.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4';
      console.log('🎥 [DEBUG] Tipo de video detectado:', videoType);
      
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        autoplay: false,
        preload: 'auto',
        html5: {
          vhs: {
            overrideNative: true,
            withCredentials: false
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false
        },
        sources: [{
          src: videoSrc,
          type: videoType
        }]
      });
      
      playerRef.current.ready(() => {
        console.log('✅ [DEBUG] Player ready');
      });
      
      playerRef.current.on('loadstart', () => {
        console.log('🔄 [DEBUG] Iniciando carga...');
      });
      
      playerRef.current.on('loadedmetadata', () => {
        console.log('📊 [DEBUG] Metadata cargada');
      });
      
      playerRef.current.on('canplay', () => {
        console.log('▶️ [DEBUG] Video listo para reproducir');
      });
      
      playerRef.current.on('error', (e) => {
        const error = playerRef.current.error();
        console.error('❌ [DEBUG] Error del reproductor:', {
          code: error?.code,
          message: error?.message,
          event: e
        });
        setLinkError('Error del reproductor: ' + (error?.message || 'Error desconocido'));
      });
      
      playerRef.current.on('play', () => {
        console.log('▶️ [DEBUG] Reproducción iniciada');
      });
      
      playerRef.current.on('pause', () => {
        console.log('⏸️ [DEBUG] Reproducción pausada');
      });
    } else {
      console.error('❌ [DEBUG] videoRef.current es null!');
    }
  };

  const selectEpisode = (episode) => {
    setCurrentEpisode(episode);
    setStreamUrl(null);
    setShowEpisodes(false);
    autoGenerateAndPlay(episode);
  };

  const autoGenerateAndPlay = (stream) => {
    console.log('🎬 [DEBUG] autoGenerateAndPlay llamado con:', stream);
    console.log('🎬 [DEBUG] URL del stream:', stream.url);
    
    setLinkError(null);
    setStreamUrl(stream.url);
    console.log('🎬 [DEBUG] streamUrl establecido:', stream.url);
  };

  const selectServer = (serverIndex) => {
    console.log('💻 [DEBUG] Cambiando a servidor:', serverIndex);
    setSelectedServer(serverIndex);
    const stream = movie.streams[serverIndex];
    
    console.log('💻 [DEBUG] Stream seleccionado:', stream);
    if (stream) {
      autoGenerateAndPlay(stream);
    }
  };



  const groupEpisodesBySeason = (streams) => {
    const seasons = {};
    streams.forEach(stream => {
      if (!seasons[stream.season]) {
        seasons[stream.season] = [];
      }
      seasons[stream.season].push(stream);
    });
    return seasons;
  };

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  if (loading) return <div className="p-4 text-white">Cargando...</div>;
  if (!movie) return <div className="p-4 text-white">Contenido no encontrado</div>;

  const isSeries = movie.type === 'series';
  const seasons = isSeries ? groupEpisodesBySeason(movie.streams) : null;

    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0f18] to-black min-h-screen pb-10">
      {/* Header Premium */}
      <div className="px-6 py-5 bg-gray-900/40 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-50 border-b border-gray-800 shadow-2xl">
        <div>
          <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-md flex items-center gap-3">
            <span className="bg-stream-blue/20 text-blue-500 p-2 rounded-lg shadow-inner">
              {isSeries ? '📺' : '🎬'}
            </span>
            {movie.title}
          </h1>
          {isSeries && currentEpisode && (
            <p className="text-gray-400 font-medium text-sm mt-1 flex items-center gap-2">
              <span className="text-white bg-gray-800 px-2 py-0.5 rounded text-xs border border-gray-700">
                T{currentEpisode.season}
              </span>
              <span className="text-white bg-gray-800 px-2 py-0.5 rounded text-xs border border-gray-700">
                E{currentEpisode.episode}
              </span>
              <span className="text-gray-500">•</span>
              {currentEpisode.episode_title}
            </p>
          )}
        </div>
        
        {isSeries && (
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="group flex items-center gap-2 bg-gray-800/80 hover:bg-stream-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-700 hover:border-stream-blue transition-all shadow-lg active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${showEpisodes ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {showEpisodes ? 'Ocultar Episodios' : 'Seleccionar Episodio'}
          </button>
        )}
      </div>

      {/* Opciones de Servidor Elegantes */}
      {movie && movie.streams && movie.streams.length > 1 && (
        <div className="px-6 mt-6 mb-2">
          <div className="flex flex-wrap gap-3">
            {movie.streams.map((stream, index) => (
              <button
                key={index}
                onClick={() => selectServer(index)}
                className={`relative overflow-hidden px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 flex flex-col items-start min-w-[140px] shadow-lg border ${
                  selectedServer === index
                    ? 'bg-gradient-to-br from-stream-blue to-blue-600 text-white border-stream-blue shadow-blue-500/20'
                    : 'bg-gray-800/40 backdrop-blur-md text-gray-300 hover:bg-gray-700/60 border-gray-700/50 hover:border-gray-500/50'
                }`}
              >
                {selectedServer === index && (
                  <span className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-bl-full"></span>
                )}
                <span className="text-sm">Opción {index + 1}</span>
                {stream.server && (
                  <span className={`text-[10px] mt-0.5 tracking-wider uppercase font-semibold ${selectedServer === index ? 'text-red-100' : 'text-gray-500'}`}>
                    {stream.server}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reproductor de Video Premium */}
      {streamUrl && (
        <div className="px-4 sm:px-6 mt-6">
          {/* Oculto: <div className="mb-2 text-xs text-gray-500">[DEBUG] streamUrl: {streamUrl}</div> */}
          
          <div className="w-full max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-gray-700/50 ring-1 ring-white/5 bg-black relative">
            {(streamUrl.includes('streamtape.com') || streamUrl.includes('bysekoze.com') || streamUrl.includes('/e/')) && !iframeError ? (
              <div className="relative aspect-video w-full bg-gray-900 group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stream-blue opacity-50"></div>
                </div>
                {streamUrl.includes('bysekoze.com') ? (
                  <>
                    <VideoFrame 
                      src={streamUrl} 
                      onError={() => setIframeError(true)}
                    />
                    
                    <div className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setIframeError(true)}
                        className="bg-gray-900/80 backdrop-blur-md hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl border border-gray-700 transition-all"
                      >
                        ¿Falla la reproducción? Alternativa
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <VideoFrame 
                      src={streamUrl} 
                      onError={() => setIframeError(true)}
                    />
                    
                    <div className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setIframeError(true)}
                        className="bg-gray-900/80 backdrop-blur-md hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl border border-gray-700 transition-all"
                      >
                        ¿Falla la reproducción? Alternativa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : iframeError || (streamUrl.includes('streamtape.com') || streamUrl.includes('bysekoze.com') || streamUrl.includes('/e/')) ? (
              <div className="w-full aspect-video flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                <div className="relative z-10 text-center p-8 max-w-md bg-gray-800/40 backdrop-blur-lg rounded-3xl border border-gray-700 shadow-2xl">
                  <div className="w-16 h-16 bg-stream-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-stream-blue/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stream-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-white text-lg font-bold mb-2">Bloqueo de Navegador Detectado</p>
                  <p className="text-gray-400 text-sm mb-6">Tu navegador está impidiendo que el reproductor incrustado funcione correctamente.</p>
                  <a 
                    href={streamUrl} 
                    target="_blank" rel="noopener noreferrer"
                    className="bg-gradient-to-r from-stream-blue to-blue-600 hover:from-blue-600 hover:to-blue-500 px-6 py-3 rounded-xl text-white font-bold shadow-[0_10px_20px_rgba(0,51,160,0.3)] transition-transform hover:scale-105 inline-flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    Abrir Externamente
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={streamUrl}
                  className="w-full h-full absolute inset-0 object-contain outline-none"
                  controls
                  preload="metadata"
                  playsInline
                  autoPlay
                  onError={(e) => {
                    console.log('Video error:', e);
                    setLinkError('Error cargando video');
                  }}
                />
              </div>
            )}
            
            {/* Ambient Base Light */}
            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-stream-blue/50 to-transparent shadow-[0_-5px_15px_rgba(0,51,160,0.5)]"></div>
          </div>
          
          {/* Botón para recargar si falla */}
          {linkError && (
            <div className="mt-2 text-center">
              <button
                onClick={() => {
                  setLinkError(null);
                  window.location.reload();
                }}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm mr-2"
              >
                Recargar Página
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {linkError && (
        <div className="px-4 mb-4">
          <div className="p-3 bg-blue-900 border border-blue-700 rounded text-blue-200">
            Error: {linkError}
          </div>
        </div>
      )}

      {/* Loading/Error Messages */}
      {!streamUrl && !linkError && (
        <div className="px-4 py-8 text-center">
          <p className="text-gray-400 text-lg">
            {isSeries && !currentEpisode 
              ? 'Selecciona un episodio para reproducir'
              : 'Cargando video...'}
          </p>
        </div>
      )}

      {/* Lista de Episodios Premium */}
      {isSeries && showEpisodes && (
        <div className="px-6 mt-8 max-w-7xl mx-auto pb-10">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-stream-blue/5 blur-3xl rounded-full pointer-events-none"></div>
            
            {Object.keys(seasons).sort((a, b) => a - b).map(seasonNum => (
              <div key={seasonNum} className="mb-10 last:mb-0 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-white text-2xl font-extrabold tracking-tight">
                    Temporada {seasonNum}
                  </h3>
                  <div className="h-px bg-gray-800 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {seasons[seasonNum]
                    .sort((a, b) => a.episode - b.episode)
                    .map(episode => {
                      const isActive = currentEpisode?.season === episode.season && currentEpisode?.episode === episode.episode;
                      return (
                        <button
                          key={`${episode.season}-${episode.episode}`}
                          onClick={() => selectEpisode(episode)}
                          className={`relative group text-left transition-all duration-300 transform active:scale-95 rounded-2xl overflow-hidden border ${
                            isActive
                              ? 'bg-stream-blue border-stream-blue shadow-[0_10px_20px_rgba(0,51,160,0.3)] hover:bg-blue-600'
                              : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-500/50 hover:bg-gray-700/60 backdrop-blur-sm'
                          }`}
                        >
                          <div className={`px-5 py-4 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-200'}`}>
                                Ep. {episode.episode}
                              </span>
                              {episode.quality && (
                                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                                  isActive ? 'bg-red-800/50 text-red-100' : 'bg-gray-900 border border-gray-600 text-gray-400'
                                }`}>
                                  {episode.quality}
                                </span>
                              )}
                            </div>
                            <div className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-red-100' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              {episode.episode_title || `Episodio ${episode.episode}`}
                            </div>
                          </div>
                          
                          {/* Indicador Play Over */}
                          <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-opacity ${
                            isActive ? 'bg-white text-stream-blue opacity-100' : 'bg-white/10 text-white opacity-0 group-hover:opacity-100'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                      );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;