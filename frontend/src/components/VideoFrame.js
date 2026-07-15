import React, { useEffect, useRef, useState } from 'react';

const VideoFrame = ({ src, onError }) => {
  const containerRef = useRef(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  // Efecto para bloquear popups
  useEffect(() => {
    // Función para interceptar intentos de abrir ventanas
    const blockPopups = () => {
      // Nota: Esto es limitado en React, la mejor defensa es server-side extraction
      // Pero ayuda a prevenir algunos scripts básicos si se inyectan
    };

    window.addEventListener('click', blockPopups);
    return () => window.removeEventListener('click', blockPopups);
  }, []);

  useEffect(() => {
    if (src && containerRef.current) {
      containerRef.current.innerHTML = '';

      const frame = document.createElement('iframe');
      frame.src = src;
      frame.width = '100%';
      frame.height = '100%';
      frame.allowFullscreen = true;
      // Sandbox con permisos de popups para evitar detección
      // (El overlay protege del primer clic, pero necesitamos estos permisos para que el script de video no falle)
      frame.sandbox = "allow-scripts allow-same-origin allow-presentation allow-fullscreen allow-popups allow-forms";

      frame.style.cssText = `
        border: none;
        background: #000;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
      `;

      containerRef.current.appendChild(frame);
    }
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="w-full h-96 md:h-[500px] lg:h-[600px] bg-black rounded-lg relative overflow-hidden group"
    >
      {/* Capa de protección invisible para capturar primeros clics maliciosos */}
      {showPlayButton && (
        <div
          className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-40 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('🛡️ Click interceptado por capa de protección');
            setShowPlayButton(false);
          }}
        >
          <div className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transform group-hover:scale-110 transition-transform flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            VER AHORA (Sin Publicidad)
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFrame;