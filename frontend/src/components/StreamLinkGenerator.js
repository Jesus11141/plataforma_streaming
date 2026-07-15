import React, { useState } from 'react';
import { generateStreamLink } from '../services/api';

const StreamLinkGenerator = ({ movieId, sourceUrl, onLinkGenerated, onError, forceRefresh = false }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const generateLink = async (refresh = false) => {
    if (!sourceUrl) {
      onError('URL de origen requerida');
      return;
    }

    setLoading(true);
    setProgress(refresh ? 'Regenerando enlace...' : 'Conectando al servidor...');

    try {
      setProgress('Extrayendo enlace fresco...');
      const result = await generateStreamLink(movieId, sourceUrl, refresh || forceRefresh);
      
      if (result.success) {
        setProgress('¡Enlace generado!');
        onLinkGenerated(result.url);
      } else {
        throw new Error(result.error || 'Error generando enlace');
      }
    } catch (error) {
      console.error('Error:', error);
      onError(error.message || 'Error generando enlace');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Generador de Enlaces</h3>
        <div className="flex gap-2">
          <button
            onClick={() => generateLink(false)}
            disabled={loading || !sourceUrl}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              loading || !sourceUrl
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {loading ? 'Generando...' : 'Generar Enlace'}
          </button>
          <button
            onClick={() => generateLink(true)}
            disabled={loading || !sourceUrl}
            className={`px-3 py-2 rounded font-medium transition-colors ${
              loading || !sourceUrl
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
            title="Forzar enlace fresco"
          >
            🔄
          </button>
        </div>
      </div>
      
      {progress && (
        <div className="text-sm text-gray-300 mb-2">
          {progress}
        </div>
      )}
      
      {loading && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-red-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      )}
    </div>
  );
};

export default StreamLinkGenerator;