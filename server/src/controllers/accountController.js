import OnboardingRecord from '../models/OnboardingRecord.js';
import { getRecommendations, categorizeProfile } from '../services/recommender.js';
import { v4 as uuidv4 } from 'uuid';

function generateAccountNumber() {
  const prefix = '3';
  const digits = Math.floor(Math.random() * 9e10 + 1e10).toString();
  return prefix + digits.slice(0, 10);
}

function generateCustomerId() {
  return 'SBIH' + Math.floor(Math.random() * 9e5 + 1e5);
}

export async function createAccount(req, res, next) {
  try {
    const { profile, sessionId, kycData, onboardingTime } = req.body;

    if (!profile || !profile.name) {
      return res.status(400).json({ success: false, error: 'Profile with name is required' });
    }

    const category = categorizeProfile(profile);
    const recommendations = getRecommendations(category);
    const accountNumber = generateAccountNumber();
    const customerId = generateCustomerId();

    const record = await OnboardingRecord.create({
      sessionId: sessionId || uuidv4(),
      accountNumber,
      customerId,
      ifscCode: 'SBIN0001234',
      branchName: 'HyperOne Digital Branch',
      profile: { ...profile, category },
      kycDocuments: {
        panVerified: !!(kycData?.panNumber),
        aadhaarVerified: !!(kycData?.aadhaarNumber),
        panNumber: kycData?.panNumber || null,
        aadhaarNumber: kycData?.aadhaarNumber || null,
      },
      recommendedProducts: recommendations.map(r => r.name),
      status: 'account_created',
      onboardingTime: onboardingTime || null,
    });

    res.json({
      success: true,
      data: {
        accountNumber: record.accountNumber,
        customerId: record.customerId,
        ifscCode: record.ifscCode,
        branchName: record.branchName,
        profile: record.profile,
        recommendedProducts: record.recommendedProducts,
        createdAt: record.completedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
