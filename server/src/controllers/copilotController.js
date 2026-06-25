import OnboardingRecord from '../models/OnboardingRecord.js';
import { streamCopilotResponse } from '../services/copilotGemini.js';

export async function chatWithCopilot(req, res, next) {
  try {
    const { customerId, accountNumber } = req.customer; // from requireCustomerAuth middleware
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Messages array is required.' });
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
