import express from 'express';
import { 
  createJob, 
  getRecruiterJobs, 
  getJobApplicants, 
  updateApplicationStatus, 
  updateApplicationNotes,
  duplicateJob,
  getRecruiterStats,
  getRecentActivity,
  getRecruiterAnalytics,
  bulkUpdateApplicationStatus,
  deleteJob,
  updateCompanyProfile
} from '../controllers/recruiterController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected and restricted to recruiters
router.use(protect);
router.use(authorize('recruiter'));

// Jobs
router.route('/jobs')
  .post(createJob)
  .get(getRecruiterJobs);

router.route('/jobs/:id')
  .delete(deleteJob);

router.post('/jobs/:id/duplicate', duplicateJob);

// Stats & Analytics
router.get('/stats', getRecruiterStats);
router.get('/activity', getRecentActivity);
router.get('/analytics', getRecruiterAnalytics);

// Applicants & Applications
router.get('/jobs/:jobId/applicants', getJobApplicants);
router.patch('/applications/bulk-status', bulkUpdateApplicationStatus);
router.patch('/applications/:id/status', updateApplicationStatus);
router.patch('/applications/:id/notes', updateApplicationNotes);

// Profile
router.put('/profile', updateCompanyProfile);

export default router;
