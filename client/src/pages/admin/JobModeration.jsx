import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { StatusBadge } from '../../components/ui/badge';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Loader2,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import api from '../../lib/api';

export default function JobModeration() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/jobs?status=${statusFilter}`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.postedBy?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Job Monitoring</h1>
          <p className="text-secondary text-sm">Track which companies are posting, where jobs are located, and how much student activity each role gets.</p>
        </div>
      </div>

      <Card className="p-4 bg-white border-border/50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by title or company..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Filter size={18} className="text-secondary" />
           <select 
             className="bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent font-medium text-primary"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
           >
             <option value="all">All Jobs</option>
             <option value="approved">Active Jobs</option>
             <option value="pending">Pending Review</option>
             <option value="rejected">Rejected</option>
           </select>
        </div>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>
        ) : filteredJobs.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
             <Table className="min-w-full">
                <TableHeader className="bg-gray-50/50">
                   <TableRow>
                      <TableHead>Job Detail</TableHead>
                      <TableHead>Recruiter</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Applicants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredJobs.map((job) => (
                      <TableRow key={job._id} className="hover:bg-gray-50/50 transition-colors group">
                         <TableCell>
                            <div>
                               <p className="font-bold text-primary">{job.title}</p>
                               <p className="text-[10px] text-secondary uppercase tracking-tight">{job.jobType}</p>
                            </div>
                         </TableCell>
                         <TableCell>
                            <p className="font-bold text-primary text-sm">{job.postedBy?.companyName || 'Unknown'}</p>
                            <p className="text-[10px] text-secondary">{job.postedBy?.name}</p>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1 text-xs text-secondary font-medium">
                               <MapPin size={12} className="text-accent" />
                               {job.location}
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1 text-xs text-primary font-bold">
                               <Users size={12} className="text-accent" />
                               {job.applicantCount || 0}
                            </div>
                         </TableCell>
                         <TableCell><StatusBadge status={job.status} /></TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1 text-xs text-secondary font-medium">
                               <Calendar size={12} className="text-accent" />
                               {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
          </div>
        ) : (
          <div className="py-20 text-center text-secondary">
             <Briefcase size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="font-bold text-lg">No jobs matching your criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
