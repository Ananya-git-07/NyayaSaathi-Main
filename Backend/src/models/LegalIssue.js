import mongoose from 'mongoose';

const legalIssueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueType: {
    type: String,
    enum: ["Aadhaar Issue", "Pension Issue", "Land Dispute", "Court Summon", "Certificate Missing", "Fraud Case", "Other"],
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ["Pending", "Submitted", "Escalated", "Resolved"],
    default: "Pending"
  },
  kiosk: { type: mongoose.Schema.Types.ObjectId, ref: 'Kiosk' },
  assignedParalegal: { type: mongoose.Schema.Types.ObjectId, ref: 'Paralegal' },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('LegalIssue', legalIssueSchema);