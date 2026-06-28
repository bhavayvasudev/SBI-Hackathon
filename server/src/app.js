import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import chatRoutes from './routes/chat.js';
import accountRoutes from './routes/account.js';
import analyticsRoutes from './routes/analytics.js';
import kycRoutes from './routes/kyc.js';
import authRoutes from './routes/auth.js';
import copilotRoutes from './routes/copilot.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Recursively strip HTML/script tags from all string values in request body
function sanitizeBody(req, res, next) {
  const strip = (v) => typeof v === 'string' ? v.replace(/<[^>]*>/g, '').trim() : v;
  function deep(obj) {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const k of Object.keys(obj)) {
        obj[k] = typeof obj[k] === 'object' ? deep(obj[k]) : strip(obj[k]);
      }
    }
    return obj;
  }
  if (req.body) deep(req.body);
  next();
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints (10 failed req/min per IP)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use('/api/auth/', authLimiter);
app.use('/api/', sanitizeBody);

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'HyperOne API v1.0' }));
app.use('/api/chat', chatRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/copilot', copilotRoutes);

app.use(errorHandler);

export default app;
