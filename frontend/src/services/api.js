import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getMovies = async (filters = {}) => {
  const response = await api.get('/movies', { params: filters });
  return response.data;
};

export const getMovie = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

export const getGenres = async () => {
  const response = await api.get('/categories/genres');
  return response.data;
};

export const createMovie = async (movieData) => {
  const response = await api.post('/movies', movieData);
  return response.data;
};

export const exportM3U = async () => {
  const response = await api.get('/export/export-m3u');
  return response.data;
};

export const exportJSON = async () => {
  const response = await api.get('/export/export-json');
  return response.data;
};

export const deleteMovie = async (id) => {
  const response = await api.delete(`/movies/${id}`);
  return response.data;
};

export const updateMovie = async (id, movieData) => {
  const response = await api.put(`/movies/${id}`, movieData);
  return response.data;
};

// Generador de enlaces de streaming
export const generateStreamLink = async (movieId, sourceUrl, forceRefresh = false) => {
  const response = await api.post('/streaming/generate-link', {
    movieId,
    sourceUrl,
    forceRefresh
  });
  return response.data;
};

export const generateMultipleLinks = async (requests) => {
  const response = await api.post('/streaming/generate-multiple', {
    requests
  });
  return response.data;
};

export const verifyStreamLink = async (movieId, url) => {
  const response = await api.get(`/streaming/verify/${movieId}`, {
    params: { url }
  });
  return response.data;
};

// Canales de TV
export const getChannels = async (filters = {}) => {
  const response = await api.get('/channels', { params: filters });
  return response.data;
};

export const getChannel = async (id) => {
  const response = await api.get(`/channels/${id}`);
  return response.data;
};

export const createChannel = async (channelData) => {
  const response = await api.post('/channels', channelData);
  return response.data;
};

export const updateChannel = async (id, channelData) => {
  const response = await api.put(`/channels/${id}`, channelData);
  return response.data;
};

export const deleteChannel = async (id) => {
  const response = await api.delete(`/channels/${id}`);
  return response.data;
};

export const importM3UFromUrl = async (url, listName) => {
  const response = await api.post('/channels/import-m3u', { url, listName });
  return response.data;
};

export const deleteAllManualChannels = async () => {
  const response = await api.delete('/channels/all/manual');
  return response.data;
};

export const deleteChannelList = async (listId) => {
  const response = await api.delete(`/channels/list/${listId}`);
  return response.data;
};

export const getChannelLists = async () => {
  const response = await api.get('/channels/lists');
  return response.data;
};