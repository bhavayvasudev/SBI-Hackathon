import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import OnboardingRecord from '../models/OnboardingRecord.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hyperone-jwt-secret-2026';

export async function loginCustomer(req, res, next) {
  try {
    const { customerId, mpin } = req.body;
    if (!customerId || !mpin) {
      return res.status(400).json({ success: false, error: 'Customer ID and MPIN are required.' });
    }

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
      { expiresIn: '7d' }
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
      return res.status(404).json({ success: false, error: 'Customer not found.' });
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
