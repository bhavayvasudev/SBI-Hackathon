import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Customer from '../models/Customer.js';
import OnboardingRecord from '../models/OnboardingRecord.js';
import { JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRES_IN, ADMIN_JWT_EXPIRES_IN } from '../config/jwt.js';
import { addToDenylist } from '../middleware/security.js';

// These are validated at startup in server.js — they will always be set here.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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

    // jwtid becomes the `jti` claim — used to invalidate individual tokens on logout
    const token = jwt.sign(
      { customerId: customer.customerId, accountNumber: customer.accountNumber },
      JWT_SECRET,
      { algorithm: JWT_ALGORITHM, expiresIn: JWT_EXPIRES_IN, jwtid: uuidv4() }
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

export async function logoutCustomer(req, res) {
  // req.customer is set by requireCustomerAuth; jti + exp come from the JWT payload
  const { jti, exp } = req.customer;
  addToDenylist(jti, exp);
  res.json({ success: true });
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
      { algorithm: JWT_ALGORITHM, expiresIn: ADMIN_JWT_EXPIRES_IN, jwtid: uuidv4() }
    );

    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
}

export async function logoutAdmin(req, res) {
  // req.admin is set by requireAdminAuth
  const { jti, exp } = req.admin;
  addToDenylist(jti, exp);
  res.json({ success: true });
}
