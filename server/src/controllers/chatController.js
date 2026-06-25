import { streamChatResponse } from '../services/gemini.js';
import { getRecommendations, categorizeProfile } from '../services/recommender.js';
import Conversation from '../models/Conversation.js';
import { v4 as uuidv4 } from 'uuid';

export async function chat(req, res, next) {
  try {
    const { messages, sessionId } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
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
