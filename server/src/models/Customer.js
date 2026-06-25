import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerId:     { type: String, unique: true, required: true },
  accountNumber:  { type: String, unique: true, required: true },
  onboardingRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'OnboardingRecord' },
  mpinHash:       { type: String, required: true },
  isActive:       { type: Boolean, default: true },
  lastLogin:      { type: Date },
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
