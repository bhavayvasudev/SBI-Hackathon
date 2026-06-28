import OnboardingRecord from '../models/OnboardingRecord.js';
import { streamCopilotResponse } from '../services/copilotGemini.js';

const VALID_ROLES = new Set(['user', 'model']);
const MAX_MESSAGES = 20;
const MAX_MSG_LENGTH = 2000;

export async function chatWithCopilot(req, res, next) {
  try {
    const { customerId, accountNumber } = req.customer; // from requireCustomerAuth middleware
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required.' });
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

    // Fetch real customer data from MongoDB
    const record = await OnboardingRecord.findOne({ customerId });
    if (!record) {
      return res.status(404).json({ success: false, error: 'Customer profile not found.' });
    }

    const customerData = {
      customerId: record.customerId,
      accountNumber: record.accountNumber,
      ifscCode: record.ifscCode,
      branchName: record.branchName,
      profile: record.profile,
      kycDocuments: record.kycDocuments,
      recommendedProducts: record.recommendedProducts,
      status: record.status,
    };

    await streamCopilotResponse(messages, customerData, res);
  } catch (err) {
    // If headers not sent yet, pass to error handler; otherwise just end
    if (!res.headersSent) {
      next(err);
    } else {
      console.error('[Copilot] Unhandled error after headers sent:', err.message);
      res.end();
    }
  }
}
