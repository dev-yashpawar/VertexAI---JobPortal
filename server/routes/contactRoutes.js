import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitFeedback } from '../controllers/contactController.js';

const router = express.Router();

const feedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: 'Too many feedback submissions. Please try again later.' }
});

router.post('/feedback', feedbackLimiter, submitFeedback);

export default router;
