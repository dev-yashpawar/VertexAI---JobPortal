import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { StatusBadge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users,
  Briefcase, 
  Search, 
  Filter, 
  Copy, 
  Trash2, 
  ExternalLink,
  Loader2,
  Plus
} from 'lucide-react';
import api from '../../lib/api';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Fetch Jobs Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    if (!window.confirm('Are you sure you want to duplicate this job?')) return;
    try {
      await api.post(`/recruiter/jobs/${id}/duplicate`);
      fetchJobs();
    } catch {
      alert('Failed to duplicate job.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job permanently?')) return;
    try {
      await api.delete(`/recruiter/jobs/${id}`);
      setJobs(jobs.filter(j => j._id !== id));
    } catch {
      alert('Failed to delete job.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manage Your Job Postings</h1>
          <p className="text-secondary text-sm">Control your hiring lifecycle and track applicant volumes.</p>
        </div>
        <Button 
          onClick={() => navigate('/recruiter/jobs/create')}
          className="bg-primary hover:bg-primary/90 text-white flex gap-2 items-center"
        >
          <Plus size={18} /> Add New Position
        </Button>
      </div>

      <Card className="p-4 border-border/50 shadow-sm bg-white mt-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by job title..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-secondary shrink-0" />
            <select 
              className="w-full md:w-auto bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent font-medium text-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Live</option>
              <option value="pending">Pending Review</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : filteredJobs.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="min-w-[200px] whitespace-nowrap">Position Title</TableHead>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="whitespace-nowrap">Pipeline</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Posted On</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-bold text-primary min-w-[200px]">{job.title}</TableCell>
                    <TableCell className="capitalize text-secondary text-xs font-medium">{job.jobType || 'Internship'}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs min-w-[170px]">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <Users className="w-4 h-4 text-accent" />
                          {job.applicantCount || 0} total applicants
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            Applied: {job.appliedCount || 0}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-green-50 text-green-700">
                            Shortlisted: {job.shortlistedCount || 0}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            Accepted: {job.acceptedCount || 0}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-red-50 text-red-700">
                            Rejected: {job.rejectedCount || 0}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={job.status} /></TableCell>
                    <TableCell className="text-[10px] sm:text-xs text-secondary whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                          <Link to={`/recruiter/jobs/${job._id}/ats`}>
                             <Button variant="outline" size="sm" className="h-9 text-xs font-bold border-accent/20 text-accent hover:bg-accent hover:text-white px-3 flex items-center gap-1">
                               Manage <span className="hidden sm:inline">Applications</span> <ExternalLink size={12} />
                             </Button>
                          </Link>
                          <div className="flex border border-border rounded-lg overflow-hidden h-9">
                             <button onClick={() => handleDuplicate(job._id)} title="Duplicate" className="px-3 hover:bg-gray-100 text-secondary border-r border-border"><Copy size={16}/></button>
                             <button onClick={() => handleDelete(job._id)} title="Delete" className="px-3 hover:bg-red-50 text-red-500"><Trash2 size={16}/></button>
                          </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-20 text-center text-secondary flex flex-col items-center">
            <Briefcase size={48} className="text-gray-200 mb-4" />
            <p className="font-medium text-lg">No jobs found matching your criteria.</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
