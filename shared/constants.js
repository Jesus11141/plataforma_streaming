// Configuración compartida entre frontend y mobile
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

export const MOVIE_QUALITIES = {
  '480p': '480p',
  '720p': '720p',
  '1080p': '1080p',
  '4K': '4K',
};

export const GENRES = [
  'Acción',
  'Aventura',
  'Animación',
  'Comedia',
  'Drama',
  'Fantasía',
  'Horror',
  'Romance',
  'Ciencia Ficción',
  'Thriller'
];