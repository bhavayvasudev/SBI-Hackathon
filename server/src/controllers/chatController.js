import { streamChatResponse } from '../services/gemini.js';
import { getRecommendations, categorizeProfile } from '../services/recommender.js';
import Conversation from '../models/Conversation.js';
import { v4 as uuidv4 } from 'uuid';

const VALID_ROLES = new Set(['user', 'model']);
const MAX_MESSAGES = 20;
const MAX_MSG_LENGTH = 2000;

export async function chat(req, res, next) {
  try {
    const { messages, sessionId } = req.body;
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
