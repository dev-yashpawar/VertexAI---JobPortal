import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String, required: true }],
  stipend: { type: String },
  location: { type: String, required: true },
  jobType: { type: String, enum: ['internship', 'full-time'], default: 'internship' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'closed'], default: 'approved' },
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;
