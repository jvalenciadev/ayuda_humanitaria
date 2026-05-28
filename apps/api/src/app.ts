import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import router modules
import authRoutes from './routes/auth';
import ayudaRoutes from './routes/ayudas';
import reporteRoutes from './routes/reportes';
import victimaRoutes from './routes/victimas';
import logRoutes from './routes/logs';
import comunicadoRoutes from './routes/comunicados';

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading uploaded assets from frontend
}));

// In production, set CORS_ORIGIN to your Vercel frontend URL
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Global Rate Limiting - Protection from Denial of Service (DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { error: 'Demasiadas peticiones desde esta dirección IP. Inténtelo de nuevo más tarde.' }
});
app.use(limiter);

// Serve static uploads (Note: on serverless, uploads are ephemeral)
app.use('/uploads', express.static(path.join(__dirname, '../../../../uploads')));

// Healthy Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servicio de Ayuda Humanitaria activo', timestamp: new Date() });
});

// Register REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/ayudas', ayudaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/victimas', victimaRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/comunicados', comunicadoRoutes);

// Centralized error-handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: 'Ocurrió un error interno en el servidor.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
