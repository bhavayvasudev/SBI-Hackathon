import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import chatRoutes from './routes/chat.js';
import accountRoutes from './routes/account.js';
import analyticsRoutes from './routes/analytics.js';
import kycRoutes from './routes/kyc.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'HyperOne API v1.0' }));
app.use('/api/chat', chatRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/kyc', kycRoutes);

app.use(errorHandler);

export default app;
