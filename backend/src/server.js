require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const configRoutes = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 8000;

// Configuración de CORS
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman o curl) o si está en la lista permitida
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(null, true); // Permisivo para desarrollo y plantillas
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  return res.json({
    ok: true,
    ts: Math.floor(Date.now() / 1000),
    service: 'PlantillaCotillón Node.js REST API',
    database: process.env.DATABASE_URL?.includes('postgres') ? 'PostgreSQL' : 'SQLite (Prisma)',
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', configRoutes);

// Manejo 404 para rutas /api no encontradas
app.use('/api', (req, res) => {
  res.status(404).json({ detail: 'Ruta no encontrada en la API de PlantillaCotillón.' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ detail: 'Error interno del servidor.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PlantillaCotillón API corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📡 Modo de base de datos: ${process.env.DATABASE_URL?.includes('postgres') ? 'PostgreSQL' : 'SQLite local'}`);
});
