import express from 'express';
import { 
  getAdminOverview, 
  getPendingJobs, 
  approveJob, 
  rejectJob,
  deleteJob,
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getAdminApplications,
  getReports,
  resolveReport,
  getAdminAnalytics
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin')); // Apply middleware to all routes in this file

router.get('/overview', getAdminOverview);
router.get('/analytics', getAdminAnalytics);

router.get('/jobs', getPendingJobs);
router.patch('/jobs/:id/approve', approveJob);
router.patch('/jobs/:id/reject', rejectJob);
router.delete('/jobs/:id', deleteJob);

router.get('/users', getUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

router.get('/applications', getAdminApplications);
router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);

export default router;
