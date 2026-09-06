import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import SidebarLayout from './components/layout/SidebarLayout';
import RecruiterLayout from './components/layout/RecruiterLayout';

// Basic wrapper for pages that feature Navbar & Footer
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 bg-background text-foreground">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout with Navbar only (for Admin/Generic)
const NavbarLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </div>
    </main>
  </div>
);

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import JobsExplorer from './pages/student/JobsExplorer';
import ApplicationTracker from './pages/student/ApplicationTracker';
import Profile from './pages/student/Profile';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import SavedJobs from './pages/student/SavedJobs';
import Notifications from './pages/student/Notifications';
import Settings from './pages/student/Settings';
import JobDetails from './pages/student/JobDetails';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import CreateJob from './pages/recruiter/CreateJob';
import JobApplicants from './pages/recruiter/JobApplicants';
import AllApplicants from './pages/recruiter/AllApplicants';
import Analytics from './pages/recruiter/Analytics';
import RecruiterNotifications from './pages/recruiter/RecruiterNotifications';
import CompanySettings from './pages/recruiter/CompanySettings';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminOverview from './pages/admin/Overview';
import JobModeration from './pages/admin/JobModeration';
import RecruiterManagement from './pages/admin/RecruiterManagement';
import StudentManagement from './pages/admin/StudentManagement';
import ApplicationMonitoring from './pages/admin/ApplicationMonitoring';
import FraudControl from './pages/admin/FraudControl';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/jobs" element={<JobsExplorer />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/applications" element={<ApplicationTracker />} />
            <Route path="/saved" element={<SavedJobs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume" element={<ResumeAnalyzer />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Protected Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<ManageJobs />} />
            <Route path="/recruiter/jobs/create" element={<CreateJob />} />
            <Route path="/recruiter/jobs/:jobId/ats" element={<JobApplicants />} />
            <Route path="/recruiter/applicants" element={<AllApplicants />} />
            <Route path="/recruiter/analytics" element={<Analytics />} />
            <Route path="/recruiter/notifications" element={<RecruiterNotifications />} />
            <Route path="/recruiter/settings" element={<CompanySettings />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminOverview />} />
            <Route path="/admin/jobs" element={<JobModeration />} />
            <Route path="/admin/recruiters" element={<RecruiterManagement />} />
            <Route path="/admin/students" element={<StudentManagement />} />
            <Route path="/admin/applications" element={<ApplicationMonitoring />} />
            <Route path="/admin/reports" element={<FraudControl />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}
