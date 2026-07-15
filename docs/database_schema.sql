-- RaulFlix Database Schema
-- Ejecutar en Supabase SQL Editor

-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS streams CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS channels CASCADE;

-- Tabla de películas y series
CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('movie', 'series', 'live')),
  genre VARCHAR(100),
  year INTEGER,
  rating DECIMAL(3,1),
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de streams (episodios para series, fuentes para películas)
CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  quality VARCHAR(20),
  season INTEGER,
  episode INTEGER,
  episode_title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_movies_type ON movies(type);
CREATE INDEX idx_movies_created_at ON movies(created_at DESC);
CREATE INDEX idx_streams_movie_id ON streams(movie_id);
CREATE INDEX idx_streams_season_episode ON streams(season, episode);

-- Tabla de canales de TV en vivo
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  logo TEXT,
  category VARCHAR(100),
  stream_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para canales
CREATE INDEX idx_channels_category ON channels(category);
CREATE INDEX idx_channels_country ON channels(country);
CREATE INDEX idx_channels_active ON channels(active);

-- Habilitar Row Level Security (RLS)
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público para lectura
CREATE POLICY "Permitir lectura pública de movies" ON movies
  FOR SELECT USING (true);

CREATE POLICY "Permitir lectura pública de streams" ON streams
  FOR SELECT USING (true);

-- Políticas de escritura (ajustar según necesites autenticación)
CREATE POLICY "Permitir inserción de movies" ON movies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de movies" ON movies
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de movies" ON movies
  FOR DELETE USING (true);

CREATE POLICY "Permitir inserción de streams" ON streams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de streams" ON streams
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de streams" ON streams
  FOR DELETE USING (true);

CREATE POLICY "Permitir lectura pública de channels" ON channels
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de channels" ON channels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de channels" ON channels
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de channels" ON channels
  FOR DELETE USING (true);
