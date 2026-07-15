import React, { useState } from 'react';
import { createChannel } from '../../services/api';

const AddChannel = () => {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    category: '',
    logo: '',
    stream_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    'Noticias',
    'Entretenimiento', 
    'Deportes',
    'Películas',
    'Series',
    'Música',
    'Infantil',
    'Documentales',
    'Religioso',
    'Educativo',
    'Variedades',
    'Internacional',
    'Radio',
    'Radio Noticias',
    'Radio Deportes',
    'Radio Música',
    'Radio Religiosa',
  ];

  const countries = [
    'España', 'México', 'Argentina', 'Colombia', 'Chile', 'Perú',
    'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay',
    'Costa Rica', 'Panamá', 'Guatemala', 'Honduras', 'El Salvador',
    'Nicaragua', 'República Dominicana', 'Puerto Rico', 'Cuba',
    'Estados Unidos', 'Brasil', 'Francia', 'Italia', 'Alemania',
    'Reino Unido', 'Portugal', 'Internacional'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country || !formData.category || !formData.stream_url) {
      setMessage('Todos los campos son obligatorios excepto el logo');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await createChannel(formData);
      setMessage('Canal agregado exitosamente');
      setFormData({
        name: '',
        country: '',
        category: '',
        logo: '',
        stream_url: ''
      });
    } catch (error) {
      setMessage('Error al agregar canal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-2">Agregar Canal / Radio</h1>
      <p className="text-gray-400 mb-6">Agrega un canal de TV o una emisora de radio</p>
      
      {/* Selector tipo */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setFormData({...formData, category: ''})}
          className="flex-1 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-red-500 transition-all text-center"
        >
          📺 Canal de TV
        </button>
        <button
          type="button"
          onClick={() => setFormData({...formData, category: 'Radio'})}
          className="flex-1 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-red-500 transition-all text-center"
        >
          📻 Radio
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre del Canal */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Nombre del Canal *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: CNN en Español, Telecinco, Televisa..."
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:border-red-500 focus:outline-none"
            required
          />
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-medium mb-2">
            País *
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:border-red-500 focus:outline-none"
            required
          >
            <option value="">Seleccionar país</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Categoría *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:border-red-500 focus:outline-none"
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium mb-2">
            URL del Logo (opcional)
          </label>
          <input
            type="url"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            placeholder="https://ejemplo.com/logo.png"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Stream URL */}
        <div>
          <label className="block text-sm font-medium mb-2">
            URL del Stream *
          </label>
          <input
            type="text"
            name="stream_url"
            value={formData.stream_url}
            onChange={handleChange}
            placeholder={formData.category?.includes('Radio') ? 'https://stream.radio.com/live' : 'https://ejemplo.com/stream.m3u8'}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:border-red-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.category?.includes('Radio') 
              ? 'Formatos: .mp3, .aac, .ogg, .m3u8' 
              : 'Formatos: .m3u8, .mp4, .ts'}
          </p>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded transition-colors"
        >
          {loading ? 'Agregando...' : `Agregar ${formData.category?.includes('Radio') ? 'Radio' : 'Canal'}`}
        </button>
      </form>

      {/* Mensaje */}
      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('Error') 
            ? 'bg-red-900 border border-red-700 text-red-200' 
            : 'bg-green-900 border border-green-700 text-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Vista previa */}
      {formData.name && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h3 className="text-lg font-semibold mb-2">Vista Previa</h3>
          <div className="flex items-center space-x-3">
            {formData.logo && (
              <img 
                src={formData.logo} 
                alt="Logo" 
                className="w-12 h-12 object-contain bg-white rounded"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div>
              <div className="font-medium">{formData.name}</div>
              <div className="text-sm text-gray-400">
                {formData.country} • {formData.category}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddChannel;