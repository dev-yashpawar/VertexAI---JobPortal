import { useState, useEffect, useCallback } from 'react';
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
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Loader2,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import api from '../../lib/api';

const COLORS = ['#0f172a', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d', 'year'

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/analytics?range=${timeRange}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">System Analytics</h1>
          <p className="text-secondary text-sm">Actionable insights and growth trajectories for the platform.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-border shadow-sm">
           <button 
             onClick={() => setTimeRange('7d')}
             className={`px-4 py-2 text-xs font-bold rounded-lg transition ${timeRange === '7d' ? 'bg-accent text-white shadow-md' : 'text-secondary hover:text-primary'}`}
           >
             Last 7 Days
           </button>
           <button 
             onClick={() => setTimeRange('30d')}
             className={`px-4 py-2 text-xs font-bold rounded-lg transition ${timeRange === '30d' ? 'bg-accent text-white shadow-md' : 'text-secondary hover:text-primary'}`}
           >
             Month
           </button>
           <button 
             onClick={() => setTimeRange('year')}
             className={`px-4 py-2 text-xs font-bold rounded-lg transition ${timeRange === 'year' ? 'bg-accent text-white shadow-md' : 'text-secondary hover:text-primary'}`}
           >
             Year
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Line Chart */}
        <Card className="p-6 border-border/50 shadow-sm bg-white">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="font-bold text-primary flex items-center gap-2">
                    <TrendingUp className="text-accent w-5 h-5" />
                    User Registration Growth
                 </h3>
                 <p className="text-[10px] text-secondary mt-1 uppercase tracking-wider font-bold">New Accounts in Last Period</p>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-bold text-primary">+{data?.userGrowth?.reduce((sum, d) => sum + d.count, 0) || 0}</p>
                 <p className="text-[10px] text-green-600 font-bold uppercase">Growth Active</p>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data?.userGrowth}>
                    <defs>
                       <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="_id" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fill: '#64748b' }}
                       dy={10}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Job Status Distribution */}
        <Card className="p-6 border-border/50 shadow-sm bg-white">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="font-bold text-primary flex items-center gap-2">
                    <Layers className="text-accent w-5 h-5" />
                    Job Status Distribution
                 </h3>
                 <p className="text-[10px] text-secondary mt-1 uppercase tracking-wider font-bold">Listing Health Analysis</p>
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="h-[300px] w-full md:w-1/2">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={data?.jobDistribution}
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {data?.jobDistribution?.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                 {data?.jobDistribution?.map((entry, index) => (
                    <div key={entry._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs font-bold text-primary capitalize">{entry._id}</span>
                       </div>
                       <span className="text-sm font-bold text-primary">{entry.count}</span>
                    </div>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 border-border/50 shadow-sm bg-white overflow-hidden relative">
            <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 -rotate-12" />
            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Conversion Rate</h4>
            <p className="text-3xl font-extrabold text-primary">{data?.conversionRate || 0}%</p>
            <div className="mt-4 flex items-center gap-2 text-green-600">
               <span className="text-xs font-bold">Based on applications</span>
            </div>
         </Card>
         <Card className="p-6 border-border/50 shadow-sm bg-white overflow-hidden relative">
            <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 -rotate-12" />
            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Active Students</h4>
            <p className="text-3xl font-extrabold text-primary">{data?.activeStudents?.toLocaleString() || 0}</p>
            <div className="mt-4 flex items-center gap-2 text-green-600">
               <span className="text-xs font-bold">Total candidates</span>
            </div>
         </Card>
         <Card className="p-6 border-border/50 shadow-sm bg-white overflow-hidden relative">
            <Briefcase className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 -rotate-12" />
            <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Success Matches</h4>
            <p className="text-3xl font-extrabold text-primary">{data?.successMatches || 0}</p>
            <div className="mt-4 flex items-center gap-2 text-green-600">
               <span className="text-xs font-bold">Shortlisted/Hired</span>
            </div>
         </Card>
      </div>
    </div>
  );
}
