import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChannel } from '../services/api';
import Hls from 'hls.js';

const RADIO_CATEGORIES = ['radio', 'music', 'música'];
const isRadio = (cat) => RADIO_CATEGORIES.some(r => cat?.toLowerCase().includes(r));

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&fs=1&color=white&controls=1`;
  const channelMatch = url.match(/youtube\.com\/channel\/([^/]+)/);
  if (channelMatch) return `https://www.youtube.com/embed/live_stream?channel=${channelMatch[1]}&autoplay=1&rel=0&modestbranding=1`;
  return null;
};

const isYoutube = (url) => url?.includes('youtube.com') || url?.includes('youtu.be');

const ChannelPlayer = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const hlsRef = useRef(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamError, setStreamError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadChannel();
    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [id]);

  const loadChannel = async () => {
    try {
      const data = await getChannel(id);
      setChannel(data);
      setTimeout(() => loadStream(data), 500);
    } catch (err) {
      setError('Canal no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const loadStream = (data) => {
    const url = data.stream_url;
    const radio = isRadio(data.category);
    if (isYoutube(url)) return;
    if (radio) loadAudio(url);
    else loadVideo(url);
  };

  const loadAudio = (url) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = url;
    audio.volume = volume;
    audio.addEventListener('canplay', () => {
      audio.play().then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      }).catch((err) => {
        if (err.name === 'NotAllowedError') setAutoplayBlocked(true);
        else setStreamError(true);
      });
    }, { once: true });
    audio.addEventListener('error', () => setStreamError(true), { once: true });
  };

  const loadVideo = (url) => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    const isM3U8 = url.includes('.m3u8') || url.includes('.ts');

    const tryLoad = (src, isFallback = false) => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true, xhrSetup: (xhr) => { xhr.withCredentials = false; } });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (e, data) => {
        if (data.fatal) {
          hls.destroy();
          if (!isFallback) {
            tryLoad(url, true);
          } else {
            setStreamError(true);
          }
        }
      });
      hlsRef.current = hls;
    };

    if (isM3U8 && Hls.isSupported()) {
      tryLoad(`/api/channels/fetch-m3u?url=${encodeURIComponent(url)}`, false);
    } else {
      // MP4 u otros formatos: usar proxy para evitar CORS
      const proxyUrl = `/api/channels/proxy-segment?url=${encodeURIComponent(url)}`;
      video.src = proxyUrl;
      video.onerror = () => {
        // Si falla el proxy, intentar directo
        video.src = url;
        video.onerror = () => setStreamError(true);
      };
      video.play().then(() => setIsPlaying(true)).catch(() => {
        video.src = url;
        video.play().then(() => setIsPlaying(true)).catch(() => setStreamError(true));
      });
    }
  };

  const togglePlay = () => {
    const media = isRadio(channel?.category) ? audioRef.current : videoRef.current;
    if (!media) return;
    if (isPlaying) { media.pause(); setIsPlaying(false); }
    else { media.play(); setIsPlaying(true); }
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    const media = isRadio(channel?.category) ? audioRef.current : videoRef.current;
    if (media) media.volume = val;
  };

  const toggleMute = () => {
    const media = isRadio(channel?.category) ? audioRef.current : videoRef.current;
    if (!media) return;
    media.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-stream-blue"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-white text-center">
      <p className="text-blue-400 mb-4">{error}</p>
      <Link to="/" className="bg-stream-blue px-4 py-2 rounded">Volver</Link>
    </div>
  );

  const radio = isRadio(channel?.category);

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Header General */}
      <div className="px-6 py-4 bg-gray-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-50 border-b border-gray-800">
        <Link to={radio ? '/radio' : '/channels'} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a {radio ? 'Radio' : 'TV'}
        </Link>
        <span className="bg-stream-blue/20 text-blue-500 border border-stream-blue/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-stream-blue animate-pulse"></span>
          EN VIVO
        </span>
      </div>
      {radio ? (
        /* ===== REPRODUCTOR RADIO (DISEÑO TEATRO UNIFICADO) ===== */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Contenedor Principal Glassmorphism (Idéntico a TV) */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-gray-700/50 overflow-hidden ring-1 ring-white/5">
            
            {/* Header del Reproductor (Idéntico a TV) */}
            <div className="p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4 md:gap-6 border-b border-gray-800 bg-gradient-to-r from-gray-900/80 to-transparent">
              {channel.logo ? (
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white/5 rounded-2xl p-1.5 shadow-inner border border-gray-700/50 backdrop-blur-sm">
                  <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain rounded-xl overflow-hidden bg-white/5" onError={(e) => e.target.style.display = 'none'} />
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-stream-blue/10 text-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-stream-blue/20">
                  📻
                </div>
              )}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">{channel.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-stream-blue animate-pulse"></span>
                    En Directo
                  </span>
                  {channel.country && <span className="text-gray-400 text-sm font-medium">{channel.country}</span>}
                  <span className="text-gray-600 text-sm">•</span>
                  <span className="text-gray-400 text-sm font-medium">{channel.category}</span>
                </div>
              </div>

              {/* Botón Flotante para control rápido en cabezal */}
              <button
                onClick={togglePlay}
                className="hidden sm:flex bg-gradient-to-br from-stream-blue to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white p-3 rounded-full shadow-[0_10px_20px_rgba(0,51,160,0.3)] transition-all hover:scale-110 active:scale-95"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                )}
              </button>
            </div>

            {/* Ventana "Cinemática" para la Estación de Radio (Misma estructura que el Video) */}
            <div className="w-full bg-[#050505] relative aspect-[21/9] md:aspect-video flex items-center justify-center overflow-hidden group">
              
              {/* Halos de luz dinámicos en el fondo */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-stream-blue/20 blur-[120px] transition-opacity duration-1000 rounded-full pointer-events-none ${isPlaying ? 'opacity-100 scale-110' : 'opacity-30 scale-100'}`}></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
                {/* Logo Central Magnificado */}
                <div className={`relative w-32 h-32 md:w-48 md:h-48 mb-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700/50 flex items-center justify-center shadow-2xl transition-transform duration-700 ${isPlaying ? 'scale-105 shadow-[0_0_50px_rgba(0,51,160,0.2)]' : 'scale-100'}`}>
                  <div className={`absolute inset-0 rounded-full border border-stream-blue/30 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : 'opacity-0'}`}></div>
                  {channel.logo ? (
                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover rounded-full bg-black p-2 relative z-10" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-full h-full text-6xl md:text-8xl flex items-center justify-center relative z-10">📻</div>
                  )}
                </div>

                {/* Ecualizador Minimalista Wide */}
                <div className="h-16 md:h-20 w-full max-w-sm flex items-end justify-between gap-1 mb-6 opacity-90 px-4">
                  {[...Array(32)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm ${isPlaying ? 'bg-gradient-to-t from-stream-blue to-blue-400' : 'bg-gray-800'}`}
                      style={{
                        height: isPlaying ? `${Math.max(15, (((i * 7) % 80) + 20))}%` : '8px',
                        animationName: isPlaying ? 'wave' : 'none',
                        animationDuration: `${0.3 + (i % 5) * 0.1}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDirection: 'alternate',
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Controles Flotantes Superpuestos en el Bottom (Al estilo Video) */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                  <button onClick={togglePlay} className="w-14 h-14 bg-stream-blue hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,51,160,0.4)] transition-transform hover:scale-110 active:scale-95">
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    )}
                  </button>
                  <span className="text-white font-medium bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-700 text-sm">
                    {isPlaying ? 'Reproduciendo' : 'Pausado'}
                  </span>
                </div>

                {/* Control de Volumen Integrado */}
                <div className="flex items-center gap-3 w-full sm:w-64 bg-gray-900/80 backdrop-blur border border-gray-700/50 p-2.5 rounded-xl shadow-lg">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {isMuted ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      )}
                    </svg>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolume}
                    className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-stream-blue"
                  />
                </div>
              </div>

              {/* Mensaje de Error / Autoplay Bloqueado */}
              {(streamError || autoplayBlocked) && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center">
                  <div className="w-16 h-16 bg-stream-blue/20 rounded-full flex items-center justify-center mb-4 border border-stream-blue/30">
                    {autoplayBlocked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stream-blue" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stream-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12 a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-white text-xl font-bold mb-2">
                    {autoplayBlocked ? 'Listo para reproducir' : 'Error de Conexión'}
                  </p>
                  <p className="text-gray-400 text-sm mb-6 max-w-sm">
                    {autoplayBlocked ? 'El navegador requiere que inicies la reproducción manualmente.' : 'La transmisión está fuera de línea o el navegador bloqueó la conexión.'}
                  </p>
                  <button 
                    onClick={() => {
                      setStreamError(false);
                      setAutoplayBlocked(false);
                      loadAudio(channel.stream_url);
                    }} 
                    className="bg-stream-blue hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                  >
                    {autoplayBlocked ? '▶ Reproducir' : 'Reintentar Conexión'}
                  </button>
                </div>
              )}
            </div>

            {/* Ambient Line Inferior */}
            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-stream-blue/50 to-transparent shadow-[0_-5px_15px_rgba(0,51,160,0.5)]"></div>
            
            {/* Audio oculto HTML5 */}
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
          </div>
        </div>

      ) : (
        /* ===== REPRODUCTOR TV PREMIUM ===== */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Contenedor Principal Glassmorphism */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-700/50 overflow-hidden ring-1 ring-white/5">
            
            {/* Header del Reproductor */}
            <div className="p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4 md:gap-6 border-b border-gray-800 bg-gradient-to-r from-gray-900/80 to-transparent">
              {channel.logo ? (
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-white/5 rounded-2xl p-1.5 shadow-inner border border-gray-700/50 backdrop-blur-sm">
                  <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain rounded-xl overflow-hidden bg-white/5" onError={(e) => e.target.style.display = 'none'} />
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-red-600/10 text-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-red-500/20">
                  📺
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">{channel.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full font-semibold letter-spacing-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    En Directo
                  </span>
                  <span className="text-gray-400 text-sm font-medium">{channel.country}</span>
                  <span className="text-gray-600 text-sm">•</span>
                  <span className="text-gray-400 text-sm font-medium">{channel.category}</span>
                </div>
              </div>
            </div>

            {/* Ventana de Video */}
            <div className="w-full bg-black relative aspect-video flex items-center justify-center group overflow-hidden">
              {isYoutube(channel.stream_url) ? (
                <div 
                  id="yt-container"
                  className="relative w-full h-[150%] md:h-full pb-[56.25%] md:pb-0 overflow-hidden" 
                >
                  <iframe
                    src={getYoutubeEmbedUrl(channel.stream_url)}
                    style={{
                      position: 'absolute',
                      top: '-60px',
                      left: '-2px',
                      width: 'calc(100% + 4px)',
                      height: 'calc(100% + 120px)',
                      border: 'none',
                    }}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    title={channel.name}
                  />
                  {/* Máscara superior - bloquea clic al canal */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '70px', background: '#000', zIndex: 10, pointerEvents: 'auto' }} />
                  {/* Gradiente hover - bloquea clic al título */}
                  <div style={{ position: 'absolute', top: '70px', left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)', zIndex: 10, pointerEvents: 'auto' }} />
                  {/* Bloquear esquina superior izquierda (logo YouTube) */}
                  <div style={{ position: 'absolute', top: '70px', left: 0, width: '120px', height: '40px', background: 'transparent', zIndex: 10, pointerEvents: 'auto' }} />
                  {/* Bloquear esquina superior derecha (botones) */}
                  <div style={{ position: 'absolute', top: '70px', right: 0, width: '120px', height: '40px', background: 'transparent', zIndex: 10, pointerEvents: 'auto' }} />
                  {/* Máscara inferior profunda (esconde botones YT nativos si se asoman) */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45px', background: 'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent)', zIndex: 10, pointerEvents: 'none' }} />
                  
                  {/* OVERLAY DEL REPRODUCTOR (Controles Personalizados Flotantes) */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-10 pointer-events-none flex flex-col justify-end p-4 md:p-6 opacity-0 group-hover:opacity-100">
                    <div className="w-full flex justify-end">
                      {/* Botón fullscreen propio */}
                      <button
                        onClick={() => {
                          const el = document.getElementById('yt-container');
                          if (el.requestFullscreen) el.requestFullscreen();
                          else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                        }}
                        className="bg-gray-900/80 hover:bg-red-600 text-white p-2.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl text-sm font-semibold shadow-xl backdrop-blur-md transition-all flex items-center gap-2 border border-gray-700 hover:border-red-500 pointer-events-auto transform hover:scale-105 active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="hidden md:inline">Pantalla Completa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : streamError ? (
                <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-gray-900 gap-4 opacity-90 p-4 text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <p className="text-gray-300 text-lg">Señal no disponible en el navegador</p>
                  <p className="text-gray-500 text-sm mb-2 max-w-md">Algunos canales protegen su contenido (CORS) o los navegadores bloquean su reproducción automática.</p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button onClick={() => { setStreamError(false); loadVideo(channel.stream_url); }} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-700 transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reintentar
                    </button>
                    <a href={channel.stream_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Abrir Externamente
                    </a>
                    <a href={`vlc://${channel.stream_url}`} className="bg-orange-500 hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Abrir en VLC
                    </a>
                  </div>
                </div>
              ) : (
                <video ref={videoRef} className="w-full h-full absolute inset-0 object-contain bg-black outline-none" controls autoPlay playsInline />
              )}
            </div>
            {/* Barra inferior estética */}
            <div className="h-2 w-full bg-gradient-to-r from-gray-900 via-red-900/20 to-gray-900"></div>
            {/* Botón externo siempre visible */}
            <div className="px-5 py-3 flex gap-3 justify-end border-t border-gray-800">
              <a href={channel.stream_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir Externamente
              </a>
              <a href={`vlc://${channel.stream_url}`} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105">
                Abrir en VLC
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default ChannelPlayer;
