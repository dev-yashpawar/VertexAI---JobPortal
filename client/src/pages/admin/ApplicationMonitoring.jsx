import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { 
  ClipboardList, 
  Search, 
  Loader2,
  Calendar,
  Target,
  Building2,
  MapPin
} from 'lucide-react';
import api from '../../lib/api';
import { StatusBadge } from '../../components/ui/badge';

export default function ApplicationMonitoring() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/applications');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = applications.filter(app => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      app.userId?.name?.toLowerCase().includes(term) ||
      app.jobId?.title?.toLowerCase().includes(term) ||
      app.jobId?.postedBy?.companyName?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Application Monitoring</h1>
          <p className="text-secondary text-sm">Global visibility into platform recruitment activity and candidate flow.</p>
        </div>
      </div>

      <Card className="p-4 bg-white border-border/50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by candidate or job position..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent min-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>
        ) : filteredApplications.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
             <Table className="min-w-full">
                <TableHeader className="bg-gray-50/50">
                   <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job Position</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>AI Match</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredApplications.map((app) => (
                      <TableRow key={app._id} className="hover:bg-gray-50/50 transition-colors">
                         <TableCell>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-xs">
                                  {app.userId?.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-bold text-primary text-sm">{app.userId?.name}</p>
                                  <p className="text-[10px] text-secondary">{app.userId?.email}</p>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1.5 font-bold text-primary text-sm">
                               <Target size={14} className="text-accent" />
                               {app.jobId?.title}
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                               <Building2 size={12} className="text-accent" />
                               {app.jobId?.postedBy?.companyName || app.jobId?.postedBy?.name || 'Unknown company'}
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                               <MapPin size={12} className="text-accent" />
                               {app.jobId?.location || 'Unknown'}
                            </div>
                         </TableCell>
                         <TableCell>
                            <span className="text-sm font-bold text-accent">
                               {app.matchScore || 0}%
                            </span>
                         </TableCell>
                         <TableCell><StatusBadge status={app.status} /></TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                               <Calendar size={12} className="text-accent" />
                               {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
          </div>
        ) : (
          <div className="py-20 text-center text-secondary">
             <ClipboardList size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="font-bold text-lg">No application records found.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
