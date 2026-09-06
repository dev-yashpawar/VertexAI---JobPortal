import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student', required: true },
  skills: [{ type: String }],
  resumeUrl: { type: String },
  companyName: { type: String },
  isBlocked: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  aiAnalysis: {
    resumeHash: { type: String },
    skills: [{ type: String }],
    missingSkills: [{ type: String }],
    score: { type: Number },
    suggestions: [{ type: String }],
    analyzedAt: { type: Date },
    fallback: { type: Boolean, default: false },
    fallbackReason: { type: String },
    model: { type: String }
  },
  assistantChat: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  aiCredits: { type: Number, default: 10 },
  lastCreditReset: { type: Date, default: Date.now },
  notificationSettings: {
    jobRecommendations: { type: Boolean, default: true },
    applicationAlerts: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
