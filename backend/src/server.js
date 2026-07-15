const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');
require('dotenv').config();

const movieRoutes = require('./routes/movies');
const categoryRoutes = require('./routes/categories');
const exportRoutes = require('./routes/export');
const channelRoutes = require('./routes/channels');
const streamingRoutes = require('./routes/streaming');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Supabase connection
supabase.from('movies').select('count', { count: 'exact' })
  .then(({ count, error }) => {
    if (error) {
      console.log('Supabase conectado - Tabla movies no existe aún');
    } else {
      console.log(`Supabase conectado - ${count} películas en BD`);
    }
  })
  .catch(err => console.error('Error Supabase:', err));

// Rutas
app.use('/api/movies', movieRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/test', testRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RaulFlix API funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});