import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/mailer.js';

// @desc    Get all approved jobs
// @route   GET /api/jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'approved' }).populate('postedBy', 'companyName');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for a job
// @route   POST /api/applications/apply
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    
    // Check if already applied
    const existing = await Application.findOne({ userId: req.user._id, jobId });
    if (existing) {
       return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const job = await Job.findById(jobId).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Calculate Match Score
    const user = await User.findById(req.user._id);
    let matchedCount = 0;
    job.requiredSkills.forEach((skill) => {
      if (user.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        matchedCount++;
      }
    });
    
    const matchScore = (matchedCount / job.requiredSkills.length) * 100 || 0;

    const application = await Application.create({
      userId: req.user._id,
      jobId,
      status: 'applied',
      matchScore: Math.round(matchScore)
    });
    
    // Trigger Notification for Recruiter
    try {
      await Notification.create({
        userId: job.postedBy._id,
        title: 'New Application Received',
        message: `A new candidate has applied for "${job.title}".`,
        type: 'application_update'
      });

      // Send Email Notification to Recruiter
      const subject = `New Application: ${job.title} 📄`;
      const message = `Hello ${job.postedBy.name},\n\nA new candidate has applied for your job posting: "${job.title}".\n\nLog in to your recruiter dashboard to review the applicant and their match score.\n\nBest regards,\nThe VertexJob Team`;
      
      await sendEmail(job.postedBy.email, subject, message);
    } catch (err) {
      console.error('Notification Error:', err.message);
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user applications
// @route   GET /api/applications/user
export const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload Resume wrapper
// @route   POST /api/resume/upload
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Update user resume URL
    const user = await User.findById(req.user._id);
    user.resumeUrl = req.file.path.replace(/\\\\/g, '/'); // Normalize paths
    await user.save();
    
    res.json({ message: 'Resume uploaded successfully', resumeUrl: user.resumeUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Job Details
// @route   GET /api/student/jobs/:id
export const getJobDetails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'companyName');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Bookmark a job
// @route   POST /api/student/jobs/save
export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = await User.findById(req.user._id);

    if (user.savedJobs.includes(jobId)) {
      // Remove if already saved (toggle behavior)
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
      await user.save();
      return res.json({ message: 'Job removed from bookmarks', saved: false });
    }

    user.savedJobs.push(jobId);
    await user.save();
    res.json({ message: 'Job bookmarked successfully', saved: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get saved jobs
// @route   GET /api/student/jobs/saved
export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs',
      populate: { path: 'postedBy', select: 'companyName' }
    });
    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (detailed)
// @route   GET /api/student/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/student/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, skills, password, notificationSettings } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (skills) user.skills = skills;
    if (password) user.password = password;
    if (notificationSettings) user.notificationSettings = notificationSettings;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      skills: updatedUser.skills,
      resumeUrl: updatedUser.resumeUrl,
      aiAnalysis: updatedUser.aiAnalysis,
      notificationSettings: updatedUser.notificationSettings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
