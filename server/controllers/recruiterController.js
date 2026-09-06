import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import {
  notifyStudentApplicationStatus,
  notifyStudentsAboutPublishedJob,
} from '../utils/notificationHelpers.js';

// @desc    Create a new job
// @route   POST /api/recruiter/jobs
export const createJob = async (req, res) => {
  try {
    const { title, description, requiredSkills, stipend, location, jobType } = req.body;
    
    if (!title || !description || !requiredSkills || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const job = await Job.create({
      title,
      description,
      requiredSkills,
      stipend,
      location,
      jobType,
      postedBy: req.user._id,
      status: 'approved'
    });

    const populatedJob = await Job.findById(job._id).populate('postedBy', 'name companyName');
    await notifyStudentsAboutPublishedJob(populatedJob);

    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch all jobs posted by the recruiter
// @route   GET /api/recruiter/jobs
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });

    const jobIds = jobs.map((job) => job._id);
    const applicationStats = jobIds.length
      ? await Application.aggregate([
          { $match: { jobId: { $in: jobIds } } },
          {
            $group: {
              _id: '$jobId',
              applicantCount: { $sum: 1 },
              appliedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'applied'] }, 1, 0] }
              },
              shortlistedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] }
              },
              acceptedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
              },
              rejectedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
              }
            }
          }
        ])
      : [];

    const statsMap = new Map(
      applicationStats.map((entry) => [String(entry._id), entry])
    );

    const jobsWithCount = jobs.map((job) => {
      const stats = statsMap.get(String(job._id));
      return {
        ...job.toObject(),
        applicantCount: stats?.applicantCount || 0,
        appliedCount: stats?.appliedCount || 0,
        shortlistedCount: stats?.shortlistedCount || 0,
        acceptedCount: stats?.acceptedCount || 0,
        rejectedCount: stats?.rejectedCount || 0,
      };
    });

    res.json(jobsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duplicate an existing job
// @route   POST /api/recruiter/jobs/:id/duplicate
export const duplicateJob = async (req, res) => {
  try {
    const originalJob = await Job.findById(req.params.id);
    if (!originalJob) return res.status(404).json({ message: 'Job not found' });
    
    if (String(originalJob.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const newJob = await Job.create({
      title: `${originalJob.title} (Copy)`,
      description: originalJob.description,
      requiredSkills: originalJob.requiredSkills,
      stipend: originalJob.stipend,
      location: originalJob.location,
      jobType: originalJob.jobType,
      postedBy: req.user._id,
      status: 'approved'
    });

    const populatedJob = await Job.findById(newJob._id).populate('postedBy', 'name companyName');
    await notifyStudentsAboutPublishedJob(populatedJob);

    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recruiter-wide stats
// @route   GET /api/recruiter/stats
export const getRecruiterStats = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ jobId: { $in: jobIds } });

    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'approved').length,
      pendingJobs: jobs.filter(j => j.status === 'pending').length,
      closedJobs: jobs.filter(j => j.status === 'closed').length,
      totalApplicants: applications.length,
      shortlistedCount: applications.filter(a => a.status === 'shortlisted').length,
      acceptedCount: applications.filter(a => a.status === 'accepted').length,
      rejectedCount: applications.filter(a => a.status === 'rejected').length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent activity for recruiter
// @route   GET /api/recruiter/activity
export const getRecentActivity = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(j => j._id);
    
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name skills resumeUrl')
      .populate('jobId', 'title');
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics for recruiter
// @route   GET /api/recruiter/analytics
export const getRecruiterAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    
    const analyticsData = await Promise.all(jobs.map(async (job) => {
      const count = await Application.countDocuments({ jobId: job._id });
      const shortlisted = await Application.countDocuments({ jobId: job._id, status: 'shortlisted' });
      const accepted = await Application.countDocuments({ jobId: job._id, status: 'accepted' });
      const rejected = await Application.countDocuments({ jobId: job._id, status: 'rejected' });
      
      return {
        name: job.title,
        applicants: count,
        shortlisted,
        accepted,
        rejected,
        status: job.status
      };
    }));

    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ranked applicants for a job
// @route   GET /api/recruiter/jobs/:jobId/applicants
export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email skills resumeUrl aiAnalysis createdAt');

    const rankedApplicants = applications.map(app => {
      const user = app.userId;
      
      let matchedCount = 0;
      job.requiredSkills.forEach((skill) => {
        if (user.skills && user.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
          matchedCount++;
        }
      });
      const skillMatch = Math.round((matchedCount / job.requiredSkills.length) * 100) || 0;
      
      const aiScore = user.aiAnalysis?.score || 0;
      
      let profilePoints = 0;
      if (user.name) profilePoints += 25;
      if (user.email) profilePoints += 25;
      if (user.skills?.length > 0) profilePoints += 25;
      if (user.resumeUrl) profilePoints += 25;
      const profileScore = profilePoints;
      
      const finalScore = Math.round(
        (skillMatch * 0.6) + 
        (aiScore * 0.2) + 
        (profileScore * 0.2)
      );
      
      return {
        ...app.toObject(),
        finalScore,
        breakdown: {
          skillMatch,
          aiScore,
          profileScore
        }
      };
    }).sort((a, b) => b.finalScore - a.finalScore);

    res.json(rankedApplicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update candidate status
// @route   PATCH /api/recruiter/applications/:id/status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['shortlisted', 'accepted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const application = await Application.findById(req.params.id)
      .populate({
        path: 'jobId',
        populate: { path: 'postedBy', select: 'companyName name' }
      })
      .populate('userId', 'name email');
    
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.jobId.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    application.status = status;
    await application.save();

    try {
      await notifyStudentApplicationStatus(application, status);
    } catch (err) {
      console.error('Notification Error:', err.message);
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update candidate status
// @route   PATCH /api/recruiter/applications/bulk-status
export const bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!['shortlisted', 'accepted', 'rejected'].includes(status)) {
       return res.status(400).json({ message: 'Invalid status' });
    }

    const applications = await Application.find({ _id: { $in: ids } })
      .populate({
        path: 'jobId',
        populate: { path: 'postedBy', select: 'companyName name' }
      })
      .populate('userId', 'name email');

    await Application.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    try {
      await Promise.allSettled(
        applications.map((application) => notifyStudentApplicationStatus(application, status))
      );
    } catch (err) {
      console.error('Bulk Notification Error:', err.message);
    }

    res.json({ message: 'Bulk update successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add notes to candidate application
// @route   PATCH /api/recruiter/applications/:id/notes
export const updateApplicationNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    if (String(application.jobId.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    application.notes = notes;
    await application.save();
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update company profile
// @route   PUT /api/recruiter/profile
export const updateCompanyProfile = async (req, res) => {
  try {
    const { name, email, companyName, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (companyName) user.companyName = companyName;
    if (password) user.password = password;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      companyName: updatedUser.companyName
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/recruiter/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
