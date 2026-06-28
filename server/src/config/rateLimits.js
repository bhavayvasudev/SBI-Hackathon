import rateLimit from 'express-rate-limit';

const msg = (text) => ({ success: false, error: text });

const GENERIC_THROTTLE = msg('Too many requests. Please try again later.');
const AUTH_THROTTLE    = msg('Too many requests. Please try again later.');

// ─── IP key generator ─────────────────────────────────────────────────────────
// Always key on the real TCP socket address so a spoofed X-Forwarded-For header
// cannot be used to bypass rate limits, regardless of the trust-proxy setting.
const realIp = (req) => req.socket.remoteAddress || req.ip || 'unknown';

// ─── Global baseline ──────────────────────────────────────────────────────────
// 200 requests per 15 minutes across all /api/ endpoints
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: realIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: GENERIC_THROTTLE,
});

// ─── Login ────────────────────────────────────────────────────────────────────
// 10 attempts per 15 minutes; only failed requests count toward the limit
// (skipSuccessfulRequests prevents penalising normal logins)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: realIp,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: AUTH_THROTTLE,
});

// ─── Registration ─────────────────────────────────────────────────────────────
// 5 account-creation requests per 15 minutes per IP
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: realIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: GENERIC_THROTTLE,
});

// ─── Chat ─────────────────────────────────────────────────────────────────────
// 30 requests per minute — covers both /api/chat/* and /api/copilot/*
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: realIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: GENERIC_THROTTLE,
});

// ─── Upload / KYC processing ──────────────────────────────────────────────────
// 10 document-processing requests per hour per IP
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: realIp,
  standardHeaders: true,
  legacyHeaders: false,
  message: GENERIC_THROTTLE,
});
