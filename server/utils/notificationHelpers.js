import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail } from './mailer.js';

const getCompanyName = (job) => {
  const postedBy = job?.postedBy;
  if (!postedBy) return 'a recruiter';
  return postedBy.companyName || postedBy.name || 'a recruiter';
};

const applicationStatusConfig = {
  shortlisted: {
    title: 'Application Shortlisted',
    subject: 'You have been shortlisted on VertexJob',
    message: (jobTitle, companyName) =>
      `Your application for "${jobTitle}" at "${companyName}" has been shortlisted.`,
    email: (studentName, jobTitle, companyName) =>
      `Hello ${studentName},\n\nGood news. Your application for "${jobTitle}" at "${companyName}" has been shortlisted.\n\nLog in to VertexJob to review the next steps.\n\nBest regards,\nThe VertexJob Team`,
  },
  accepted: {
    title: 'Application Accepted',
    subject: 'You have been accepted on VertexJob',
    message: (jobTitle, companyName) =>
      `Your application for "${jobTitle}" at "${companyName}" has been accepted.`,
    email: (studentName, jobTitle, companyName) =>
      `Hello ${studentName},\n\nCongratulations. Your application for "${jobTitle}" at "${companyName}" has been accepted.\n\nLog in to VertexJob to review the update and contact the recruiter if needed.\n\nBest regards,\nThe VertexJob Team`,
  },
  rejected: {
    title: 'Application Update',
    subject: 'Your VertexJob application has been updated',
    message: (jobTitle, companyName) =>
      `Your application for "${jobTitle}" at "${companyName}" has been marked as rejected.`,
    email: (studentName, jobTitle, companyName) =>
      `Hello ${studentName},\n\nYour application for "${jobTitle}" at "${companyName}" has been updated to rejected.\n\nPlease log in to VertexJob for the latest details and continue exploring other opportunities.\n\nBest regards,\nThe VertexJob Team`,
  },
};

export const notifyStudentsAboutPublishedJob = async (job) => {
  const companyName = getCompanyName(job);
  const students = await User.find({
    role: 'student',
    isBlocked: false,
    'notificationSettings.jobRecommendations': { $ne: false },
  }).select('name email');

  if (!students.length) return;

  try {
    await Notification.insertMany(
      students.map((student) => ({
        userId: student._id,
        title: 'New Job Posted',
        message: `${companyName} posted a new ${job.jobType || 'job'}: "${job.title}".`,
        type: 'job_alert',
      })),
      { ordered: false }
    );
  } catch (error) {
    console.error('Job alert notification error:', error.message);
  }

  await Promise.allSettled(
    students.map((student) =>
      sendEmail(
        student.email,
        `New job from ${companyName}: ${job.title}`,
        `Hello ${student.name},\n\nA new ${job.jobType || 'job'} has just been posted on VertexJob.\n\nRole: ${job.title}\nCompany: ${companyName}\nLocation: ${job.location}\n\nLog in to VertexJob to review the full description and apply.\n\nBest regards,\nThe VertexJob Team`
      )
    )
  );
};

export const notifyStudentApplicationStatus = async (application, status) => {
  const config = applicationStatusConfig[status];
  if (!config || !application?.userId?.email || !application?.jobId?.title) return;

  const companyName = getCompanyName(application.jobId);

  try {
    await Notification.create({
      userId: application.userId._id,
      title: config.title,
      message: config.message(application.jobId.title, companyName),
      type: 'application_update',
    });
  } catch (error) {
    console.error('Application notification error:', error.message);
  }

  try {
    await sendEmail(
      application.userId.email,
      config.subject,
      config.email(application.userId.name, application.jobId.title, companyName)
    );
  } catch (error) {
    console.error('Application email error:', error.message);
  }
};
