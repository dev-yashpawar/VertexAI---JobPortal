import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: ['applied', 'shortlisted', 'accepted', 'rejected'], default: 'applied' },
  matchScore: { type: Number, default: 0 },
  finalScore: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
