import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import OnboardingRecord from '../models/OnboardingRecord.js';
import Customer from '../models/Customer.js';
import { getRecommendations, categorizeProfile } from '../services/recommender.js';
import { JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRES_IN } from '../config/jwt.js';

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

    const category = categorizeProfile(profile);
    const recommendations = getRecommendations(category);
    const accountNumber = generateAccountNumber();
    const customerId = generateCustomerId();
    const mpin = generateMpin();
    const mpinHash = await bcrypt.hash(mpin, 12);

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
        panName: kycData?.panName || null,
        panDob: kycData?.panDob || null,
        panUploadDate: kycData?.panNumber ? new Date() : null,
        panVerificationStatus: kycData?.panNumber ? 'verified' : 'pending',
        aadhaarNumber: kycData?.aadhaarNumber || null,
        aadhaarName: kycData?.aadhaarName || null,
        aadhaarDob: kycData?.aadhaarDob || null,
        aadhaarGender: kycData?.aadhaarGender || null,
        aadhaarUploadDate: kycData?.aadhaarNumber ? new Date() : null,
        aadhaarVerificationStatus: kycData?.aadhaarNumber ? 'verified' : 'pending',
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

    // Include jti so this token can be individually revoked if needed
    const token = jwt.sign(
      { customerId, accountNumber },
      JWT_SECRET,
      { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN, jwtid: uuidv4() }
    );

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
