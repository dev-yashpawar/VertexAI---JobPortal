import { sendEmail } from '../utils/mailer.js';

const CONTACT_EMAIL = 'vertexjob.company.pvt@gmail.com';

export const submitFeedback = async (req, res) => {
  try {
    const { name, email, subject, message, type } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const safeType = type || 'general';
    const text = [
      `New feedback form submission`,
      `Type: ${safeType}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      '',
      'Message:',
      message,
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="margin: 0 0 16px; color: #111827;">New Feedback Submission</h2>
        <p><strong>Type:</strong> ${safeType}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; white-space: pre-wrap;">${message}</div>
      </div>
    `;

    await sendEmail(CONTACT_EMAIL, `VertexJob Feedback: ${subject}`, text, html);

    return res.status(200).json({
      message: 'Feedback sent successfully.',
      contactEmail: CONTACT_EMAIL,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to send feedback.' });
  }
};
