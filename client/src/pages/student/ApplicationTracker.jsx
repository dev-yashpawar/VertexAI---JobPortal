import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { StatusBadge } from '../../components/ui/badge';
import { Loader2, Briefcase, Filter, Search } from 'lucide-react';
import api from '../../lib/api';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/applications/user');
      setApplications(res.data);
      setFilteredApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = applications;
    
    if (filter !== 'all') {
      result = result.filter(app => app.status === filter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.jobId?.title?.toLowerCase().includes(term) || 
        app.jobId?.postedBy?.companyName?.toLowerCase().includes(term)
      );
    }

    setFilteredApplications(result);
  }, [filter, searchTerm, applications]);

  const stats = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Application Tracker</h1>
        <p className="text-secondary mt-1">Monitor your job pipeline. Updates from recruiters appear here in real-time.</p>
      </div>

      {/* Filter Stats */}
      <div className="flex overflow-x-auto pb-4 sm:flex-wrap gap-3 sm:gap-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'all', label: 'All', count: stats.all },
          { id: 'applied', label: 'Applied', count: stats.applied },
          { id: 'shortlisted', label: 'Shortlisted', count: stats.shortlisted },
          { id: 'accepted', label: 'Accepted', count: stats.accepted },
          { id: 'rejected', label: 'Rejected', count: stats.rejected },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`
              px-5 py-2.5 rounded-xl border transition-all flex items-center gap-2 shrink-0
              ${filter === tab.id 
                ? 'bg-primary text-white border-primary shadow-md scale-105' 
                : 'bg-white text-secondary border-border hover:border-accent hover:text-primary'}
            `}
          >
            <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab.id ? 'bg-white/20' : 'bg-gray-100'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden border border-border/50 shadow-xl shadow-gray-200/40 bg-white">
        <div className="p-4 sm:p-6 border-b border-border bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="relative w-full sm:w-80 lg:w-96">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
             <Input 
               placeholder="Search role or company..." 
               className="pl-10 bg-white h-11 border-border/60"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <Button variant="outline" className="w-full sm:w-auto gap-2 h-11 text-xs font-bold border-border/60">
             <Filter size={16} /> Filters
           </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : filteredApplications.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
            <Table className="min-w-[600px] lg:min-w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold whitespace-nowrap px-4 py-4 text-[10px] uppercase tracking-wider text-secondary">Role & Company</TableHead>
                  <TableHead className="font-bold whitespace-nowrap px-4 py-4 text-[10px] uppercase tracking-wider text-secondary font-display">Applied Date</TableHead>
                  <TableHead className="font-bold whitespace-nowrap px-4 py-4 text-[10px] uppercase tracking-wider text-secondary">Match Score</TableHead>
                  <TableHead className="text-right font-bold whitespace-nowrap px-4 py-4 text-[10px] uppercase tracking-wider text-secondary">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map(app => (
                  <TableRow key={app._id} className="hover:bg-gray-50/50 transition">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{app.jobId?.title || 'Unknown Role'}</span>
                        <span className="text-xs text-secondary">{app.jobId?.postedBy?.companyName || 'Top Tier Corp'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-secondary">
                      {new Date(app.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${app.matchScore >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${app.matchScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${app.matchScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {app.matchScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={app.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-24 text-secondary">
             <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-200" />
             <p className="text-xl font-medium">No results found.</p>
             <p className="text-sm mt-1">Try adjusting your filters or active searches.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
