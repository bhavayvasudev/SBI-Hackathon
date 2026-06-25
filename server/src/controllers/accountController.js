import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import OnboardingRecord from '../models/OnboardingRecord.js';
import Customer from '../models/Customer.js';
import { getRecommendations, categorizeProfile } from '../services/recommender.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hyperone-jwt-secret-2026';

function generateAccountNumber() {
  const prefix = '3';
  const digits = Math.floor(Math.random() * 9e10 + 1e10).toString();
  return prefix + digits.slice(0, 10);
}

function generateCustomerId() {
  return 'SBIH' + Math.floor(Math.random() * 9e5 + 1e5);
}

function generateMpin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const mpin = generateMpin();
    const mpinHash = await bcrypt.hash(mpin, 10);

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

    await Customer.create({
      customerId,
      accountNumber,
      onboardingRecord: record._id,
      mpinHash,
    });

    const token = jwt.sign({ customerId, accountNumber }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        accountNumber: record.accountNumber,
        customerId: record.customerId,
        mpin,
        token,
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
