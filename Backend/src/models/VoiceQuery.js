import mongoose from 'mongoose';

const voiceQuerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalIssue', required: true },
  spokenText: String,
  transcribedText: String,
  language: String,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('VoiceQuery', voiceQuerySchema);