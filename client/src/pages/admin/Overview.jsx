import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { StatCard } from '../../components/ui/stat-card';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Building2,
  Flag, 
  Loader2, 
  Briefcase,
  UserPlus,
  MapPin,
  Send
} from 'lucide-react';
import api from '../../lib/api';

export default function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  if (loading) {
     return <div className="flex justify-center p-20 text-accent"><Loader2 className="animate-spin w-10 h-10" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-orange-100 p-2 rounded-xl">
          <ShieldCheck className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">System Control Layer</h1>
          <p className="text-secondary text-sm">Monitor recruiters, students, company posting activity, and application movement in one place.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={metrics?.totalStudents || 0} icon={Users} trend="Global" />
        <StatCard title="Total Recruiters" value={metrics?.totalRecruiters || 0} icon={UserPlus} />
        <StatCard title="Companies Posting" value={metrics?.activeCompanies || 0} icon={Building2} />
        <StatCard title="Total Applications" value={metrics?.totalApplications || 0} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Moderation Queue Alert */}
        <Card className="p-6 bg-gradient-to-br from-primary to-primary/90 text-white border-none shadow-xl shadow-primary/20 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-lg">Platform Watch</h3>
          </div>
          <p className="text-white/80 text-sm mb-6 leading-relaxed">
            There are currently <span className="text-accent font-bold text-lg px-1">{metrics?.pendingJobs || 0}</span> jobs in the manual review queue.
            Most new jobs now publish instantly, so use this view to monitor exceptions and suspicious activity.
          </p>
          <div className="space-y-3">
             <div className="bg-white/10 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold uppercase opacity-80">Blocked Users</span>
                <span className="font-bold text-xl">{metrics?.blockedUsersCount || 0}</span>
             </div>
             <div className="bg-white/10 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold uppercase opacity-80">Pending Reports</span>
                <span className="font-bold text-xl">0</span>
             </div>
          </div>
        </Card>

        {/* Recent Activity Lists */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-6 border-border/60">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                 <Briefcase className="w-4 h-4 text-accent" />
                 Company Posting Activity
              </h3>
              <div className="space-y-3">
                 {metrics?.topCompanies?.map((company) => (
                    <div key={company.recruiterId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-border hover:bg-white transition-all">
                       <div className="min-w-0">
                          <p className="font-bold text-primary truncate text-sm">{company.companyName}</p>
                          <p className="text-[10px] text-secondary">
                            Latest role: {company.latestRole} | {company.latestLocation}
                          </p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-primary">{company.jobsPosted} posts</p>
                          <p className="text-[10px] text-secondary">{company.liveJobs} live</p>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="p-6 border-border/60">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                 <Send className="w-4 h-4 text-accent" />
                 Recent Student Applications
              </h3>
              <div className="space-y-3">
                  {metrics?.recentApplications?.map((application) => (
                    <div key={application._id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-transparent hover:border-border hover:bg-white transition-all">
                       <div className="min-w-0">
                          <p className="font-bold text-primary truncate text-xs">{application.userId?.name}</p>
                          <p className="text-[10px] text-secondary">
                            {application.jobId?.title} | {application.jobId?.postedBy?.companyName || application.jobId?.postedBy?.name}
                          </p>
                       </div>
                       <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold text-primary">{application.status}</p>
                          <p className="text-[10px] text-secondary flex items-center gap-1 justify-end">
                            <MapPin className="w-3 h-3" />
                            {application.jobId?.location || 'Unknown'}
                          </p>
                       </div>
                    </div>
                  ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
