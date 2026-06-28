import { streamChatResponse } from '../services/gemini.js';
import { getRecommendations, categorizeProfile } from '../services/recommender.js';
import Conversation from '../models/Conversation.js';
import { v4 as uuidv4 } from 'uuid';

const VALID_ROLES = new Set(['user', 'model']);
const MAX_MESSAGES = 20;
const MAX_MSG_LENGTH = 2000;

// Per-session call limiter — prevents a single onboarding session from exhausting Gemini quota.
// IP-based rate limiting (chatLimiter in rateLimits.js) remains as the first line of defence.
const SESSION_MAX_CALLS = 25;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const _sessionCalls = new Map(); // sessionId -> { count, expiresAt }

// Periodically evict expired sessions so the Map does not grow unbounded.
const _sessionCleanup = setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of _sessionCalls) {
    if (entry.expiresAt < now) _sessionCalls.delete(id);
  }
}, 10 * 60 * 1000);
if (_sessionCleanup.unref) _sessionCleanup.unref();

function checkSessionLimit(sessionId) {
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 128) return true; // no session → rely on IP limiter
  const now = Date.now();
  const entry = _sessionCalls.get(sessionId);
  if (!entry || entry.expiresAt < now) {
    _sessionCalls.set(sessionId, { count: 1, expiresAt: now + SESSION_TTL_MS });
    return true;
  }
  if (entry.count >= SESSION_MAX_CALLS) return false;
  entry.count++;
  return true;
}

export async function chat(req, res, next) {
  try {
    const { messages, sessionId } = req.body;
    if (!checkSessionLimit(sessionId)) {
      return res.status(429).json({ success: false, error: 'Session message limit reached. Please start a new session.' });
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
    }
    if (messages.length > MAX_MESSAGES) {
      return res.status(400).json({ success: false, error: `Maximum ${MAX_MESSAGES} messages per request.` });
    }
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid message structure.' });
      }
      if (!VALID_ROLES.has(msg.role)) {
        return res.status(400).json({ success: false, error: 'Message role must be "user" or "model".' });
      }
      if (typeof msg.content !== 'string' || msg.content.length === 0) {
        return res.status(400).json({ success: false, error: 'Message content must be a non-empty string.' });
      }
      if (msg.content.length > MAX_MSG_LENGTH) {
        return res.status(400).json({ success: false, error: `Message content exceeds ${MAX_MSG_LENGTH} character limit.` });
      }
    }

    await streamChatResponse(messages, res);
  } catch (err) {
    next(err);
  }
}

export async function getRecommendationsForProfile(req, res, next) {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ success: false, error: 'Profile is required' });

    const category = categorizeProfile(profile);
    const recommendations = getRecommendations(category);

    res.json({ success: true, data: { recommendations, category } });
  } catch (err) {
    next(err);
  }
}

export function initSession(req, res) {
  const sessionId = uuidv4();
  res.json({ success: true, data: { sessionId } });
}
