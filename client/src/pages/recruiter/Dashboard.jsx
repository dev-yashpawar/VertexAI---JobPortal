import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { StatCard } from '../../components/ui/stat-card';
import { Button } from '../../components/ui/button';
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';

export default function RecruiterDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        api.get('/recruiter/stats'),
        api.get('/recruiter/activity')
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data || []);
    } catch (err) {
      console.error('Fetch Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-display">Recruiter Dashboard</h1>
          <p className="text-secondary mt-1">
            Welcome back, <span className="font-semibold text-primary">{user.name}</span>. 
            Here is what's happening with <span className="text-accent font-bold">{user.companyName}</span> today.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/recruiter/jobs/create')}
          className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 flex items-center gap-2 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <PlusCircle size={20} />
          Post a New Job
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Active Positions" 
          value={stats?.activeJobs || 0} 
          icon={Briefcase} 
          trend={stats?.activeJobs > 0 ? "Hiring Now" : null}
        />
        <StatCard 
          title="Total Applicants" 
          value={stats?.totalApplicants || 0} 
          icon={Users} 
        />
        <StatCard 
          title="Shortlisted" 
          value={stats?.shortlistedCount || 0} 
          icon={CheckCircle2} 
        />
        <StatCard 
          title="Accepted" 
          value={stats?.acceptedCount || 0} 
          icon={CheckCircle2} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications Feed */}
        <Card className="lg:col-span-2 p-6 overflow-hidden border-border/60">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <TrendingUp className="text-accent w-5 h-5" />
              Recent Applications
            </h3>
            <Link to="/recruiter/applicants" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {activity.length > 0 ? (
              activity.map((app) => (
                <div key={app._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-border hover:bg-white transition-all group gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {app.userId?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary group-hover:text-accent transition-colors truncate">{app.userId?.name}</p>
                      <p className="text-xs text-secondary flex items-center gap-1 mt-0.5 truncate">
                        Applied for <span className="font-semibold text-primary/80">{app.jobId?.title}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">
                      {app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : 'Just now'}
                    </p>
                    <Link to={`/recruiter/jobs/${app.jobId?._id}/ats`}>
                      <span className="text-xs font-bold text-accent cursor-pointer hover:underline">Review</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-secondary font-medium">No recent applications yet.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary to-primary/90 text-white border-none shadow-xl shadow-primary/30">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Recruiter Tip
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Our AI Ranking system values resume clarity and skill consistency. Encourage candidates to keep their profiles updated for better matching.
            </p>
            <div className="bg-white/10 p-4 rounded-xl">
               <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span>ATS Accuracy</span>
                  <span>98%</span>
               </div>
               <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[98%] rounded-full"></div>
               </div>
            </div>
          </Card>

          <Card className="p-6 border-border/60">
             <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
               <Calendar className="w-4 h-4 text-accent" />
               Hiring Calendar
             </h3>
             <div className="space-y-4">
                <div className="flex gap-3 text-sm">
                   <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                   <div>
                      <p className="font-bold text-primary">Interview: Sarah Conner</p>
                      <p className="text-secondary text-xs">Tomorrow, 10:00 AM</p>
                   </div>
                </div>
                <div className="flex gap-3 text-sm opacity-60">
                   <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                   <div>
                      <p className="font-bold text-primary">Review: UI/UX Applicants</p>
                      <p className="text-secondary text-xs">Completed yesterday</p>
                   </div>
                </div>
             </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
