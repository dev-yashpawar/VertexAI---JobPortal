import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { StatCard } from '../../components/ui/stat-card';
import { JobCard } from '../../components/ui/job-card';
import { Button } from '../../components/ui/button';
import { 
  Briefcase, 
  Send, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  UploadCloud, 
  Loader2,
  Zap,
  Bell,
  User as UserIcon,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import { StatusBadge } from '../../components/ui/badge';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ total: 0, applied: 0, shortlisted: 0, rejected: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate Profile Completion %
  const calculateCompletion = () => {
    let score = 0;
    if (user.name) score += 30;
    if (user.skills && user.skills.length > 0) score += 40;
    if (user.resumeUrl) score += 30;
    return score;
  };

  const completion = calculateCompletion();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Fetch applications
      const appsRes = await api.get('/student/applications/user');
      const apps = appsRes.data;
      
      const counts = apps.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, { applied: 0, shortlisted: 0, rejected: 0 });
      
      setStats({ total: apps.length, ...counts });
      setRecentApplications(apps.slice(0, 5));

      // 2. Fetch Notifications
      const notifsRes = await api.get('/student/notifications');
      setNotifications(notifsRes.data.slice(0, 3));

      // 3. Fetch AI Recommended jobs
      if (user.skills && user.skills.length > 0) {
        const aiRes = await api.post('/ai/recommend-jobs', { userSkills: user.skills });
        setRecommendedJobs(aiRes.data.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, [user.skills]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApply = async (jobId) => {
    try {
      await api.post('/student/applications/apply', { jobId });
      alert('Applied successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Student Dashboard</h1>
          <p className="text-secondary mt-1">Hello, {user?.name.split(' ')[0]}. You have {stats.shortlisted} active shortlists today.</p>
        </div>
        <div className="flex gap-3">
           <Link to="/resume">
             <Button variant="outline" className="gap-2">
               <FileText size={18} /> Analyze Resume
             </Button>
           </Link>
           <Link to="/jobs">
             <Button variant="primary" className="gap-2">
               <Zap size={18} /> Browse Jobs
             </Button>
           </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Applications" value={stats.total} icon={Briefcase} />
        <StatCard title="Shortlisted" value={stats.shortlisted} icon={CheckCircle2} trend="Positive" />
        <StatCard title="In Review" value={stats.applied} icon={Send} />
        <StatCard title="Not Selected" value={stats.rejected} icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Recent Activity */}
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
               <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                 <TrendingUp size={20} className="text-accent" /> Recent Activity
               </h2>
               <Link to="/applications" className="text-accent text-sm font-medium hover:underline flex items-center gap-1">
                 View All <ChevronRight size={14} />
               </Link>
            </div>
            {recentApplications.length > 0 ? (
              <div className="divide-y divide-border">
                {recentApplications.map(app => (
                  <div key={app._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-50 transition gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-secondary shrink-0">
                         <Briefcase size={20} />
                       </div>
                       <div className="min-w-0">
                         <p className="font-bold text-primary truncate text-sm sm:text-base">{app.jobId?.title || 'Unknown Role'}</p>
                         <p className="text-xs text-secondary truncate">{app.jobId?.postedBy?.companyName || 'Top Tier Corp'}</p>
                       </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                       <StatusBadge status={app.status} />
                       <p className="text-[10px] text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-secondary italic">No recent activity yet.</div>
            )}
          </Card>

          {/* AI Recommended Jobs */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Zap size={20} className="text-yellow-500 fill-yellow-500" /> AI Matched for You
            </h2>
            {loading ? (
               <div className="flex justify-center p-12"><Loader2 className="animate-spin text-accent" /></div>
            ) : recommendedJobs.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 {recommendedJobs.map(job => (
                   <JobCard key={job._id} job={job} onApply={handleApply} />
                 ))}
               </div>
            ) : (
              <Card className="p-12 text-center border-dashed">
                <p className="text-secondary">Upload your latest resume to unlock AI recommendations.</p>
                <Link to="/resume" className="mt-4 block">
                  <Button variant="secondary">Go to Analyzer</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Right: Sidebar Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Profile Completion */}
          <Card className="p-6 bg-primary text-white border-none shadow-xl relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <UserIcon size={18} /> Profile Strength
               </h3>
               <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-bold">{completion}%</span>
                  <span className="text-xs uppercase tracking-wider text-gray-300">Complete</span>
               </div>
               <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-6">
                  <div 
                    className="bg-accent h-full transition-all duration-1000" 
                    style={{ width: `${completion}%` }}
                  />
               </div>
               <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    {user.name ? <CheckCircle2 size={16} className="text-accent" /> : <div className="w-4 h-4 rounded-full border border-white/30" />}
                    Basic Info
                  </li>
                  <li className="flex items-center gap-2">
                    {user.skills?.length > 0 ? <CheckCircle2 size={16} className="text-accent" /> : <div className="w-4 h-4 rounded-full border border-white/30" />}
                    Skills Tagged
                  </li>
                  <li className="flex items-center gap-2">
                    {user.resumeUrl ? <CheckCircle2 size={16} className="text-accent" /> : <div className="w-4 h-4 rounded-full border border-white/30" />}
                    Resume Uploaded
                  </li>
               </ul>
               {completion < 100 && (
                 <Link to="/profile">
                   <Button variant="secondary" className="w-full mt-6 bg-white text-primary hover:bg-gray-100 border-none">
                     Finsh Setup
                   </Button>
                 </Link>
               )}
             </div>
             {/* Decorative blob */}
             <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
          </Card>

          {/* Quick Notifications */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Bell size={18} className="text-accent" /> Latest Alerts
            </h3>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map(n => (
                  <div key={n._id} className="text-sm border-l-2 border-accent pl-3 py-1">
                    <p className="font-bold text-primary">{n.title}</p>
                    <p className="text-xs text-secondary line-clamp-1">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                  </div>
                ))}
                <Link to="/notifications" className="block text-center text-xs text-accent font-medium mt-4">
                  View all alerts
                </Link>
              </div>
            ) : (
              <p className="text-center py-4 text-xs text-secondary italic">Everything caught up!</p>
            )}
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
             <Link to="/resume" className="group">
               <Card className="p-4 flex flex-col items-center gap-2 text-center hover:bg-accent hover:text-white transition cursor-pointer border-dashed">
                 <UploadCloud size={24} className="text-accent group-hover:text-white" />
                 <span className="text-xs font-bold">Upload Resume</span>
               </Card>
             </Link>
             <Link to="/jobs" className="group">
               <Card className="p-4 flex flex-col items-center gap-2 text-center hover:bg-accent hover:text-white transition cursor-pointer border-dashed">
                 <Briefcase size={24} className="text-accent group-hover:text-white" />
                 <span className="text-xs font-bold">Browse Jobs</span>
               </Card>
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
