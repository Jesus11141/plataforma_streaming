# Guía de Instalación - StreamFlix

## Requisitos Previos

- Node.js 18+
- MongoDB
- Redis (opcional)
- Expo CLI (para mobile)

## Instalación Backend

```bash
cd backend
npm install
npm run dev
```

## Instalación Frontend

```bash
cd frontend
npm install
npm start
```

## Instalación Mobile

```bash
cd mobile
npm install
npx expo start
```

## Base de Datos

1. Instalar MongoDB
2. Crear base de datos 'streamflix'
3. Configurar .env en backend

## Agregar Películas

POST a `/api/movies` con:

```json
{
  "title": "Zootopia 2",
  "year": 2024,
  "genre": ["Animación", "Familia"],
  "poster": "url_poster.jpg",
  "streams": [{
    "quality": "1080p",
    "url": "https://fin-3dg-b1.r66nv9ed.com/hls2/...",
    "server": "servidor1"
  }]
}
```