import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import chatRoutes from './routes/chat.js';
import accountRoutes from './routes/account.js';
import analyticsRoutes from './routes/analytics.js';
import kycRoutes from './routes/kyc.js';
import authRoutes from './routes/auth.js';
import copilotRoutes from './routes/copilot.js';
import { errorHandler } from './middleware/errorHandler.js';
import { noStore } from './middleware/security.js';
import {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  chatLimiter,
  uploadLimiter,
} from './config/rateLimits.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ─── Trust proxy ──────────────────────────────────────────────────────────────
// Only enable when explicitly deployed behind a known reverse proxy (e.g. Nginx).
// Without this guard an attacker could spoof X-Forwarded-For to bypass rate limits.
// Rate limiters use req.socket.remoteAddress as the key regardless of this setting.
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// ─── Remove X-Powered-By ─────────────────────────────────────────────────────
// Belt-and-suspenders: Helmet's hidePoweredBy already strips this; explicit
// app.disable ensures it's gone even if Helmet is misconfigured.
app.disable('x-powered-by');

// ─── Helmet (security headers) ────────────────────────────────────────────────
app.use(helmet({
  // Content-Security-Policy: this server only serves JSON so lock it down hard.
  // frame-ancestors: 'none' prevents the API from being embedded in iframes
  // (defence against clickjacking even on JSON responses).
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },

  // Cross-Origin-Embedder-Policy: not meaningful for a JSON API.
  crossOriginEmbedderPolicy: false,

  // Cross-Origin-Opener-Policy: isolate the browsing context.
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin-Resource-Policy: only allow same-origin fetch.
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // X-Frame-Options: DENY — belt-and-suspenders alongside CSP frame-ancestors.
  frameguard: { action: 'deny' },

  // Strict-Transport-Security: enforce HTTPS in production only.
  // (Dev has no TLS, so sending HSTS in dev would break localhost.)
  hsts: isProd
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,

  // X-Content-Type-Options: nosniff — prevents MIME-type sniffing attacks.
  noSniff: true,

  // Referrer-Policy: send no Referer header so upstream URLs stay private.
  referrerPolicy: { policy: 'no-referrer' },

  // X-DNS-Prefetch-Control: off — don't leak hostnames via DNS prefetch.
  dnsPrefetchControl: { allow: false },

  // X-Permitted-Cross-Domain-Policies: none — block Adobe Flash/Acrobat.
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Explicit allowlist: only the known client origin may cross-origin-fetch.
// Locking down methods and headers prevents wild-card preflight attacks.
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Expose rate-limit headers so the client can back off gracefully.
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  // Cache preflight for 10 minutes — reduces OPTIONS round-trips.
  maxAge: 600,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
// In production use the 'combined' format (includes IP, user-agent, etc.)
// for security audit trails; 'dev' in development for readability.
app.use(morgan(isProd ? 'combined' : 'dev'));

// ─── Cache-Control: no-store on all API routes ───────────────────────────────
// Prevents browsers and reverse proxies from caching any API response.
// Critical for auth endpoints (tokens, PII) and financial data (copilot, analytics).
app.use('/api/', noStore);

// ─── Sanitization ─────────────────────────────────────────────────────────────
// Recursively strip HTML/script tags from all string values in the request body
// before any route handler sees them — including values nested inside arrays
// (e.g. the messages[] array sent to the onboarding chat endpoint).
function sanitizeBody(req, res, next) {
  const strip = (v) => typeof v === 'string' ? v.replace(/<[^>]*>/g, '').trim() : v;
  function deep(val) {
    if (Array.isArray(val)) return val.map(deep);
    if (val && typeof val === 'object') {
      for (const k of Object.keys(val)) val[k] = deep(val[k]);
      return val;
    }
    return strip(val);
  }
  if (req.body) req.body = deep(req.body);
  next();
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
app.use('/api/', globalLimiter);
app.use('/api/auth/login',       loginLimiter);
app.use('/api/auth/admin-login', loginLimiter);
app.use('/api/account/create',   registerLimiter);
app.use('/api/chat',    chatLimiter);
app.use('/api/copilot', chatLimiter);
app.use('/api/kyc',     uploadLimiter);

// ─── Sanitization (all API routes) ───────────────────────────────────────────
app.use('/api/', sanitizeBody);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'HyperOne API v1.0' }));
app.use('/api/chat',      chatRoutes);
app.use('/api/account',   accountRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/kyc',       kycRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/copilot',   copilotRoutes);

app.use(errorHandler);

export default app;
