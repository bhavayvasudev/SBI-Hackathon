import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  messages: [messageSchema],
  phase: {
    type: String,
    enum: ['greeting', 'collection', 'profile_complete', 'recommendations', 'kyc', 'done'],
    default: 'greeting',
  },
  profile: {
    name: String,
    age: Number,
    occupation: String,
    income: String,
    goals: String,
    category: { type: String, enum: ['student', 'salaried', 'business'] },
  },
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
