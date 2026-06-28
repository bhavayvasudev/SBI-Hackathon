import mongoose from 'mongoose';

const onboardingSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  accountNumber: { type: String, unique: true, required: true },
  customerId: { type: String, unique: true, required: true },
  ifscCode: { type: String, default: 'SBIN0001234' },
  branchName: { type: String, default: 'Digital Branch' },
  profile: {
    name: { type: String, required: true },
    age: Number,
    occupation: String,
    income: String,
    goals: String,
    category: { type: String, enum: ['student', 'salaried', 'business'], required: true },
  },
  kycDocuments: {
    panVerified: { type: Boolean, default: false },
    aadhaarVerified: { type: Boolean, default: false },
    panNumber: String,
    panName: String,
    panDob: String,
    panUploadDate: Date,
    panVerificationStatus: { type: String, enum: ['verified', 'pending', 'failed'], default: 'pending' },
    aadhaarNumber: String,
    aadhaarName: String,
    aadhaarDob: String,
    aadhaarGender: String,
    aadhaarUploadDate: Date,
    aadhaarVerificationStatus: { type: String, enum: ['verified', 'pending', 'failed'], default: 'pending' },
  },
  recommendedProducts: [String],
  status: {
    type: String,
    enum: ['pending', 'kyc_complete', 'account_created'],
    default: 'account_created',
  },
  onboardingTime: { type: Number },
  completedAt: { type: Date, default: Date.now },
  auditLog: [{
    action:      { type: String, enum: ['approve', 'reject'] },
    performedAt: { type: Date,   default: Date.now },
    adminJti:    String,
    ip:          String,
  }],
}, { timestamps: true });

export default mongoose.model('OnboardingRecord', onboardingSchema);
