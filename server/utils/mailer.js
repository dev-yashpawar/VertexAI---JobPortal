import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Your 16-character App Password
  },
});

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 */
export const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: `"VertexJob Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to VertexJob! 🚀',
    text: `Hello ${name},\n\nWelcome to VertexJob! We're excited to help you find your next big opportunity.\n\nLog in to your dashboard to complete your profile and start applying to jobs.\n\nBest regards,\nThe VertexJob Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5;">Welcome to VertexJob, ${name}! 🚀</h2>
        <p>We're excited to have you on board. Your journey towards the perfect career starts here.</p>
        <p><strong>What's next?</strong></p>
        <ul>
          <li>Complete your profile</li>
          <li>Upload your resume for AI analysis</li>
          <li>Apply to premium job listings</li>
        </ul>
        <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">Need help? Reply to this email or visit our support center.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[MAIL] Welcome email sent to: ${to}`);
  } catch (error) {
    console.error('[MAIL ERROR] Failed to send welcome email:', error.message);
  }
};

export const sendPasswordResetEmail = async (to, name, resetUrl) => {
  const subject = 'Reset your VertexJob password';
  const text = `Hello ${name},\n\nWe received a request to reset your VertexJob password.\n\nUse this link to choose a new password:\n${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this, you can ignore this email.\n\nBest regards,\nThe VertexJob Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #111827; margin-top: 0;">Reset your VertexJob password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">
          Create new password
        </a>
      </div>
      <p style="word-break: break-word; color: #475569; font-size: 14px;">If the button does not work, paste this link into your browser:<br />${resetUrl}</p>
      <p style="color: #475569; font-size: 14px;">This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"VertexJob Security" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[MAIL] Password reset email sent to: ${to}`);
  } catch (error) {
    console.error('[MAIL ERROR] Failed to send password reset email:', error.message);
    throw error;
  }
};

/**
 * Generic email sender
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: `"VertexJob Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`[MAIL] Notification sent to: ${to}`);
  } catch (err) {
    console.error('[MAIL ERROR] Failed to send email:', err.message);
  }
};
