import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  analyzeResume,
  recommendJobs,
  chatAssistant,
  getChatAssistantHistory,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define specific rate limits for AI operations
const resumeLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1,
  message: { message: 'Please wait 30 seconds between resume analyzes' }
});

const chatLimiter = rateLimit({
  windowMs: 3 * 1000, // 3 seconds
  max: 1,
  message: { message: 'Please wait 3 seconds between chat messages' }
});

router.post('/analyze-resume', protect, resumeLimiter, analyzeResume);
router.post('/recommend-jobs', protect, recommendJobs);
router.post('/chat-assistant', protect, chatLimiter, chatAssistant);
router.get('/chat-assistant/history', protect, getChatAssistantHistory);

export default router;
