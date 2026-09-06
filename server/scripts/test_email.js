import { sendEmail } from '../utils/mailer.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyEmail() {
  console.log('--- EMAIL CONNECTIVITY TEST ---');
  console.log('Using User:', process.env.EMAIL_USER);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
     console.error('ERROR: EMAIL_USER or EMAIL_PASS not found in .env');
     process.exit(1);
  }

  try {
     console.log('Attempting to send a test email...');
     await sendEmail(
       process.env.EMAIL_USER, 
       'VertexJob: Connection Test 🚀', 
       'If you are reading this, your Node.js backend is successfully connected to Gmail! All automated notifications are now active.'
     );
     console.log('SUCCESS: Test email sent to yourself.');
  } catch (error) {
     console.error('FAILED: Could not send email.', error.message);
  }
}

verifyEmail();
