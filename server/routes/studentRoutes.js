import express from 'express';
import { 
  getJobs, 
  getJobDetails,
  saveJob,
  getSavedJobs,
  applyForJob, 
  getUserApplications, 
  getProfile,
  updateProfile,
  uploadResume 
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Define local upload storage for Multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.]/g, '');
    cb(null, `${req.user._id}-${uniqueSuffix}-${cleanName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only PDF and DOCX are allowed."), false);
  }
  cb(null, true);
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB Limit
});

// Student specific routes
router.get('/jobs', getJobs);
router.get('/jobs/:id', protect, getJobDetails);
router.post('/jobs/save', protect, authorize('student'), saveJob);
router.get('/jobs/saved', protect, authorize('student'), getSavedJobs);

router.post('/applications/apply', protect, authorize('student'), applyForJob);
router.get('/applications/user', protect, authorize('student'), getUserApplications);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.post('/resume/upload', protect, authorize('student'), upload.single('resume'), uploadResume);

export default router;
