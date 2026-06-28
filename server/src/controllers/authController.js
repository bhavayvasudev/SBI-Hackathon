import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import OnboardingRecord from '../models/OnboardingRecord.js';
import { JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRES_IN, ADMIN_JWT_EXPIRES_IN } from '../config/jwt.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function loginCustomer(req, res, next) {
  try {
    const { customerId, mpin } = req.body;

    const customer = await Customer.findOne({ customerId: customerId.trim().toUpperCase() });
    if (!customer) {
      return res.status(401).json({ success: false, error: 'Invalid Customer ID or MPIN.' });
    }

    const valid = await bcrypt.compare(mpin, customer.mpinHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid Customer ID or MPIN.' });
    }

    customer.lastLogin = new Date();
    await customer.save();

    const token = jwt.sign(
      { customerId: customer.customerId, accountNumber: customer.accountNumber },
      JWT_SECRET,
      { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN }
    );

    const record = await OnboardingRecord.findOne({ customerId: customer.customerId });

    res.json({
      success: true,
      token,
      data: {
        customerId: customer.customerId,
        accountNumber: customer.accountNumber,
        profile: record?.profile,
        kycDocuments: record?.kycDocuments,
        recommendedProducts: record?.recommendedProducts,
        ifscCode: record?.ifscCode,
        branchName: record?.branchName,
        status: record?.status,
        completedAt: record?.completedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerProfile(req, res, next) {
  try {
    const { customerId } = req.customer;
    const record = await OnboardingRecord.findOne({ customerId });
    if (!record) {
      return res.status(404).json({ success: false, error: 'Account data unavailable.' });
    }

    res.json({
      success: true,
      data: {
        customerId: record.customerId,
        accountNumber: record.accountNumber,
        ifscCode: record.ifscCode,
        branchName: record.branchName,
        profile: record.profile,
        kycDocuments: record.kycDocuments,
        recommendedProducts: record.recommendedProducts,
        status: record.status,
        completedAt: record.completedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function loginAdmin(req, res, next) {
  try {
    const { username, password } = req.body;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { role: 'admin' },
      JWT_SECRET,
      { algorithm: JWT_ALGORITHM, expiresIn: ADMIN_JWT_EXPIRES_IN }
    );

    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
}
