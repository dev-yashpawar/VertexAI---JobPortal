import Job from '../models/Job.js';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Application from '../models/Application.js';
import { notifyStudentsAboutPublishedJob } from '../utils/notificationHelpers.js';

const enrichRecruiters = async (recruiters) => {
  if (!recruiters.length) return [];

  const recruiterIds = recruiters.map((recruiter) => recruiter._id);
  const jobs = await Job.find({ postedBy: { $in: recruiterIds } })
    .select('postedBy status createdAt location');

  const jobIds = jobs.map((job) => job._id);
  const applicationCounts = jobIds.length
    ? await Application.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } }
      ])
    : [];

  const applicationCountMap = new Map(
    applicationCounts.map((entry) => [String(entry._id), entry.count])
  );

  const recruiterStats = new Map();
  jobs.forEach((job) => {
    const recruiterId = String(job.postedBy);
    const current = recruiterStats.get(recruiterId) || {
      jobsPosted: 0,
      liveJobs: 0,
      totalApplicants: 0,
      lastJobPostedAt: null,
      primaryLocation: job.location || 'Not set',
    };

    current.jobsPosted += 1;
    if (job.status === 'approved') current.liveJobs += 1;
    current.totalApplicants += applicationCountMap.get(String(job._id)) || 0;
    if (!current.lastJobPostedAt || job.createdAt > current.lastJobPostedAt) {
      current.lastJobPostedAt = job.createdAt;
    }
    recruiterStats.set(recruiterId, current);
  });

  return recruiters.map((recruiter) => {
    const stats = recruiterStats.get(String(recruiter._id)) || {
      jobsPosted: 0,
      liveJobs: 0,
      totalApplicants: 0,
      lastJobPostedAt: null,
      primaryLocation: 'Not set',
    };

    return {
      ...recruiter.toObject(),
      ...stats,
    };
  });
};

const enrichStudents = async (students) => {
  if (!students.length) return [];

  const studentIds = students.map((student) => student._id);
  const applications = await Application.find({ userId: { $in: studentIds } })
    .sort({ createdAt: -1 })
    .populate({
      path: 'jobId',
      select: 'title location postedBy',
      populate: { path: 'postedBy', select: 'companyName name' }
    });

  const studentStats = new Map();
  applications.forEach((application) => {
    const studentId = String(application.userId);
    const current = studentStats.get(studentId) || {
      applicationsCount: 0,
      shortlistedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      latestApplication: null,
    };

    current.applicationsCount += 1;
    if (application.status === 'shortlisted') current.shortlistedCount += 1;
    if (application.status === 'accepted') current.acceptedCount += 1;
    if (application.status === 'rejected') current.rejectedCount += 1;
    if (!current.latestApplication) {
      current.latestApplication = {
        title: application.jobId?.title || 'Unknown role',
        location: application.jobId?.location || 'Unknown location',
        companyName: application.jobId?.postedBy?.companyName || application.jobId?.postedBy?.name || 'Unknown company',
        appliedAt: application.createdAt,
      };
    }

    studentStats.set(studentId, current);
  });

  return students.map((student) => {
    const stats = studentStats.get(String(student._id)) || {
      applicationsCount: 0,
      shortlistedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      latestApplication: null,
    };

    return {
      ...student.toObject(),
      ...stats,
    };
  });
};

// @desc    Get dashboard metrics
// @route   GET /api/admin/overview
export const getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const recruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    const blockedUsersCount = await User.countDocuments({ isBlocked: true });
    
    // Recent activity (last 5 items)
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name companyName');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('userId', 'name email')
      .populate({
        path: 'jobId',
        select: 'title location postedBy',
        populate: { path: 'postedBy', select: 'companyName name' }
      });

    const jobsWithCompanies = await Job.find()
      .populate('postedBy', 'companyName name')
      .select('title status postedBy location createdAt');

    const companyMap = new Map();
    jobsWithCompanies.forEach((job) => {
      const recruiterId = String(job.postedBy?._id || '');
      if (!recruiterId) return;

      const current = companyMap.get(recruiterId) || {
        recruiterId,
        companyName: job.postedBy.companyName || job.postedBy.name || 'Unknown company',
        jobsPosted: 0,
        liveJobs: 0,
        latestRole: job.title,
        latestLocation: job.location,
      };

      current.jobsPosted += 1;
      if (job.status === 'approved') current.liveJobs += 1;
      if (!current.latestRole || job.createdAt > (current.latestPostedAt || 0)) {
        current.latestRole = job.title;
        current.latestLocation = job.location;
        current.latestPostedAt = job.createdAt;
      }

      companyMap.set(recruiterId, current);
    });

    const topCompanies = [...companyMap.values()]
      .sort((left, right) => (right.jobsPosted - left.jobsPosted) || (right.liveJobs - left.liveJobs))
      .slice(0, 5);

    const activeCompanies = [...companyMap.values()].filter((company) => company.jobsPosted > 0).length;

    res.json({
      totalUsers,
      totalStudents: students,
      totalRecruiters: recruiters,
      totalJobs,
      totalApplications,
      pendingJobs,
      activeCompanies,
      blockedUsersCount,
      recentJobs,
      recentUsers,
      recentApplications,
      topCompanies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending jobs
// @route   GET /api/admin/jobs
export const getPendingJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const jobs = await Job.find(query).populate('postedBy', 'name companyName');

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => ({
        ...job.toObject(),
        applicantCount: await Application.countDocuments({ jobId: job._id }),
      }))
    );

    res.json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a job
// @route   PATCH /api/admin/jobs/:id/approve
export const approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name companyName');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const wasApproved = job.status === 'approved';
    job.status = 'approved';
    await job.save();

    if (!wasApproved) {
      await notifyStudentsAboutPublishedJob(job);
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a job
// @route   PATCH /api/admin/jobs/:id/reject
export const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    job.status = 'rejected';
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/admin/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    await Job.deleteOne({ _id: req.params.id });
    // Also delete associated applications
    await Application.deleteMany({ jobId: req.params.id });
    
    res.json({ message: 'Job and associated applications deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role && role !== 'all' ? { role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    if (role === 'recruiter') {
      return res.json(await enrichRecruiters(users));
    }

    if (role === 'student') {
      return res.json(await enrichStudents(users));
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block a user
// @route   PATCH /api/admin/users/:id/block
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isBlocked = true;
    await user.save();
    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unblock a user
// @route   PATCH /api/admin/users/:id/unblock
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isBlocked = false;
    await user.save();
    res.json({ message: 'User unblocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await User.deleteOne({ _id: req.params.id });
    // Cleanup related data
    if (user.role === 'recruiter') {
      await Job.deleteMany({ postedBy: user._id });
    }
    await Application.deleteMany({ userId: user._id });

    res.json({ message: 'User and all related data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications (Monitoring)
// @route   GET /api/admin/applications
export const getAdminApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email')
      .populate({
        path: 'jobId',
        select: 'title location postedBy',
        populate: { path: 'postedBy', select: 'companyName name email' }
      })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name email')
      .populate('jobId', 'title companyName')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve a report
// @route   PATCH /api/admin/reports/:id/resolve
export const resolveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    report.status = 'resolved';
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Analytics Data
// @route   GET /api/admin/analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    let startDate = new Date();
    let dateFormat = "%Y-%m-%d";
    
    if (range === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (range === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      dateFormat = "%Y-%m"; // Group by month for yearly view
    } else {
      startDate.setDate(startDate.getDate() - 7);
    }

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const jobDistribution = await Job.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const activeStudents = await User.countDocuments({ role: 'student' });
    const totalApplications = await Application.countDocuments();
    const successMatches = await Application.countDocuments({ 
      status: { $in: ['shortlisted', 'accepted', 'hired'] } 
    });

    const conversionRate = totalApplications > 0 
      ? ((successMatches / totalApplications) * 100).toFixed(1) 
      : 0;

    res.json({
      userGrowth,
      jobDistribution,
      activeStudents,
      successMatches,
      conversionRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
