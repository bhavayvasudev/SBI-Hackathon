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
    aadhaarNumber: String,
  },
  recommendedProducts: [String],
  status: {
    type: String,
    enum: ['pending', 'kyc_complete', 'account_created'],
    default: 'account_created',
  },
  onboardingTime: { type: Number },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('OnboardingRecord', onboardingSchema);
