import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is missing from environment variables.');
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/mailer.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, companyName } = req.body;

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // specific role validations
    if (role === 'recruiter' && !companyName) {
      return res.status(400).json({ message: 'Company name is required for recruiters' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      skills: role === 'student' ? skills : [],
      companyName: role === 'recruiter' ? companyName : undefined,
    });

    if (user) {
      // Send Welcome Email
      await sendWelcomeEmail(user.email, user.name);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (user && user.isBlocked) {
       return res.status(403).json({ message: 'User account is restricted.' });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Social login
// @route   POST /api/auth/social
export const socialLogin = async (req, res) => {
  try {
    const {
      name,
      email,
      provider = 'google',
      providerId,
      googleId,
      profilePic,
      role,
      companyName
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Social account email is required' });
    }

    let user = await User.findOne({ email });

    if (user && user.isBlocked) {
       return res.status(403).json({ message: 'User account is restricted.' });
    }

    if (!user) {
      const finalRole = role || 'student';
      const fallbackPassword = Math.random().toString(36).slice(-12) + String(providerId || googleId || Date.now()).slice(-6);
      
      user = await User.create({
        name,
        email,
        password: fallbackPassword,
        role: finalRole,
        companyName: finalRole === 'recruiter' ? companyName : undefined,
      });
      
      // Send Welcome Email for new user
      await sendWelcomeEmail(user.email, user.name);
      
      console.log(`[AUTH] Created new social user (${provider}:${finalRole}): ${email}`);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = socialLogin;

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user || user.isBlocked) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      throw error;
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset user password using token
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Token, password, and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'User account is restricted.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
