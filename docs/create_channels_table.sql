-- Crear tabla de canales de TV
CREATE TABLE IF NOT EXISTS public.channels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    logo TEXT,
    category VARCHAR(100),
    stream_url TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_channels_country ON public.channels(country);
CREATE INDEX IF NOT EXISTS idx_channels_category ON public.channels(category);
CREATE INDEX IF NOT EXISTS idx_channels_active ON public.channels(active);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (ajusta según tus necesidades)
CREATE POLICY "Enable all operations for channels" ON public.channels
    FOR ALL USING (true);

-- Insertar algunos canales de ejemplo
INSERT INTO public.channels (name, country, category, logo, stream_url) VALUES
('CNN en Español', 'Internacional', 'Noticias', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/CNN_International_logo.svg/512px-CNN_International_logo.svg.png', 'https://cnn-cnninternational-1-eu.rakuten.wurl.tv/playlist.m3u8'),
('Euronews', 'Internacional', 'Noticias', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Euronews_2016_logo.svg/512px-Euronews_2016_logo.svg.png', 'https://rakuten-euronews-1-pt.samsung.wurl.tv/manifest/playlist.m3u8'),
('NASA TV', 'Estados Unidos', 'Educativo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/512px-NASA_logo.svg.png', 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8')
ON CONFLICT DO NOTHING;