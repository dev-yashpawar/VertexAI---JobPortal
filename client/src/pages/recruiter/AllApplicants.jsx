import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { StatusBadge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  Search, 
  Filter, 
  Loader2, 
  ExternalLink,
  Calendar,
  Contact
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function AllApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAllApplicants();
  }, []);

  const fetchAllApplicants = async () => {
    try {
      setLoading(true);
      // We use the activity endpoint but without the limit for "All Applicants" or create a dedicated one.
      // For now, let's fetch all jobs then fetch all applicants for each job.
      const jobsRes = await api.get('/recruiter/jobs');
      const jobIds = jobsRes.data.map(j => j._id);
      
      const applicantsPromises = jobIds.map(id => api.get(`/recruiter/jobs/${id}/applicants`));
      const applicantsResponses = await Promise.all(applicantsPromises);
      
      const allApps = applicantsResponses.flatMap((res, index) => {
        const job = jobsRes.data[index];
        return res.data.map(app => ({
          ...app,
          jobTitle: job.title,
          jobId: job._id
        }));
      });

      // Sort by applied date desc
      setApplicants(allApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Fetch All Applicants Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Global Talent Pipeline</h1>
          <p className="text-secondary text-sm">Managing all candidates across your active and closed positions.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-border shadow-sm flex items-center gap-2">
           <Contact size={18} className="text-accent" />
           <span className="text-sm font-bold text-primary">{applicants.length} Total Applications</span>
        </div>
      </div>

      <Card className="p-4 bg-white border-border/50 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or job title..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-gray-50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent min-w-[200px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Applications</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="outline" onClick={fetchAllApplicants} className="h-10 px-4">
            Refresh
          </Button>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm">
        {loading ? (
          <div className="p-24 flex justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>
        ) : filteredApplicants.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50">
               <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Applied For</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredApplicants.map((app) => (
                  <TableRow key={app._id} className="group hover:bg-gray-50/50 transition-colors">
                     <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent text-sm">
                              {app.userId?.name?.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-primary">{app.userId?.name}</p>
                              <p className="text-[10px] text-secondary truncate max-w-[150px]">{app.userId?.email}</p>
                           </div>
                        </div>
                     </TableCell>
                     <TableCell>
                        <span className="font-bold text-primary text-xs max-w-[150px] inline-block truncate">{app.jobTitle}</span>
                     </TableCell>
                     <TableCell>
                        <span className="text-sm font-bold text-accent">{app.finalScore || 0}%</span>
                     </TableCell>
                     <TableCell>
                        <StatusBadge status={app.status} />
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                           <Calendar size={12} className="text-accent" />
                           {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                     </TableCell>
                     <TableCell className="text-right">
                        <Link to={`/recruiter/jobs/${app.jobId}/ats`}>
                           <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold border-accent/20 text-accent hover:bg-accent hover:text-white">
                              View Pipeline <ExternalLink size={10} className="ml-1" />
                           </Button>
                        </Link>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-32 text-center text-secondary">
             <Users size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="font-bold text-lg">No candidates matching your search.</p>
             <p className="text-sm">Try widening your filters or searching by a different name.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
