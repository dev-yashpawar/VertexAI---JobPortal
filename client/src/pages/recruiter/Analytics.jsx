import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Briefcase,
  Loader2,
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import api from '../../lib/api';

const COLORS = ['#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

export default function Analytics() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, statsRes] = await Promise.all([
        api.get('/recruiter/analytics'),
        api.get('/recruiter/stats')
      ]);
      setData(analyticsRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusDistribution = [
    { name: 'Shortlisted', value: stats?.shortlistedCount || 0 },
    { name: 'Accepted', value: stats?.acceptedCount || 0 },
    { name: 'Rejected', value: stats?.rejectedCount || 0 },
    {
      name: 'Pending',
      value: stats?.totalApplicants - ((stats?.shortlistedCount || 0) + (stats?.acceptedCount || 0) + (stats?.rejectedCount || 0)) || 0
    }
  ].filter(d => d.value > 0);

  if (loading) {
     return (
       <div className="h-[70vh] flex items-center justify-center">
         <Loader2 className="w-10 h-10 animate-spin text-accent" />
       </div>
     );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Recruitment Analytics</h1>
          <p className="text-secondary text-sm">Visualize your hiring pipeline and job performance.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="hidden md:flex gap-2">
             <Download size={14} /> Export Report
           </Button>
           <Button size="sm" className="flex gap-2">
             <Calendar size={14} /> Last 30 Days
           </Button>
        </div>
      </div>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="p-6 bg-white border-border/50">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-tight mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-primary">
              {stats?.totalApplicants > 0 ? Math.round((stats.shortlistedCount / stats.totalApplicants) * 100) : 0}%
            </p>
            <div className="h-1 w-full bg-gray-100 rounded-full mt-3">
               <div 
                 className="h-full bg-green-500 rounded-full" 
                 style={{ width: `${stats?.totalApplicants > 0 ? (stats.shortlistedCount / stats.totalApplicants) * 100 : 0}%` }} 
               />
            </div>
         </Card>
         <Card className="p-6 bg-white border-border/50">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-tight mb-1">Active Positions</p>
            <p className="text-2xl font-bold text-primary">{stats?.activeJobs || 0}</p>
            <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
              <TrendingUp size={10} /> +2 this month
            </p>
         </Card>
         <Card className="p-6 bg-white border-border/50">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-tight mb-1">Applications</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalApplicants || 0}</p>
            <p className="text-[10px] text-accent font-bold mt-2">Per month average: {Math.round((stats?.totalApplicants || 0) / 2)}</p>
         </Card>
         <Card className="p-6 bg-white border-border/50">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-tight mb-1">Avg Match Score</p>
            <p className="text-2xl font-bold text-primary">74.2%</p>
            <div className="flex gap-1 mt-2">
               {[1,2,3,4,5].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-accent' : 'bg-gray-100'}`} />)}
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Applications per Job Chart */}
         <Card className="p-6 bg-white border-border/50 min-h-[400px]">
            <h3 className="font-bold text-primary mb-6 flex items-center gap-2">
               <BarChart3 size={18} className="text-accent" /> Applications per Position
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" hide />
                     <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#64748b" />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'rgba(56, 189, 248, 0.05)' }}
                     />
                     <Bar dataKey="applicants" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Candidate Status Distribution */}
         <Card className="p-6 bg-white border-border/50 min-h-[400px]">
            <h3 className="font-bold text-primary mb-6 flex items-center gap-2">
               <Target size={18} className="text-accent" /> Pipeline Distribution
            </h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {statusDistribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>

      {/* Detailed Analysis Table */}
      <Card className="p-6 bg-white border-border/50">
         <h3 className="font-bold text-primary mb-6 flex items-center gap-2">
            <Briefcase size={18} className="text-accent" /> Hiring Performance by Job
         </h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-secondary uppercase tracking-wider">
                     <th className="pb-3 text-left">Job Position</th>
                     <th className="pb-3 text-center">Total Applicants</th>
                     <th className="pb-3 text-center">Shortlisted</th>
                     <th className="pb-3 text-center">Accepted</th>
                     <th className="pb-3 text-center">Rejected</th>
                     <th className="pb-3 text-right">Conversion Rate</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/40">
                  {data.map((job) => (
                     <tr key={job.name} className="hover:bg-gray-50/50">
                        <td className="py-4 font-bold text-sm text-primary">{job.name}</td>
                        <td className="py-4 text-center font-bold">{job.applicants}</td>
                        <td className="py-4 text-center text-green-600 font-bold">{job.shortlisted}</td>
                        <td className="py-4 text-center text-blue-600 font-bold">{job.accepted || 0}</td>
                        <td className="py-4 text-center text-red-600 font-bold">{job.rejected}</td>
                        <td className="py-4 text-right">
                           <span className="bg-accent/10 text-accent text-xs font-bold px-2.5 py-1 rounded-full border border-accent/20">
                             {job.applicants > 0 ? Math.round((job.shortlisted / job.applicants) * 100) : 0}%
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}
