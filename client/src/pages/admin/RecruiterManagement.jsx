import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { 
  UserRound, 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  Loader2,
  Mail,
  Building
} from 'lucide-react';
import api from '../../lib/api';

export default function RecruiterManagement() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRecruiters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users?role=recruiter');
      setRecruiters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const handleAction = async (type, id) => {
    try {
      if (type === 'block') await api.patch(`/admin/users/${id}/block`);
      if (type === 'unblock') await api.patch(`/admin/users/${id}/unblock`);
      fetchRecruiters();
    } catch {
      alert('Action failed.');
    }
  };

  const filteredRecruiters = recruiters.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'blocked' ? user.isBlocked : !user.isBlocked);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Recruiter Management</h1>
          <p className="text-secondary text-sm">Monitor recruiter accounts, companies, posting volume, and applicant flow. Restrict accounts only when necessary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border-border/50 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Total Recruiters</p>
          <p className="text-2xl font-bold text-primary mt-2">{recruiters.length}</p>
        </Card>
        <Card className="p-5 bg-white border-border/50 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Live Job Posters</p>
          <p className="text-2xl font-bold text-primary mt-2">{recruiters.filter((user) => (user.liveJobs || 0) > 0).length}</p>
        </Card>
        <Card className="p-5 bg-white border-border/50 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Restricted Recruiters</p>
          <p className="text-2xl font-bold text-primary mt-2">{recruiters.filter((user) => user.isBlocked).length}</p>
        </Card>
      </div>

      <Card className="p-4 bg-white border-border/50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or company..." 
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
             <option value="all">All Recruiters</option>
             <option value="active">Active Accounts</option>
             <option value="blocked">Blocked Accounts</option>
           </select>
        </div>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>
        ) : filteredRecruiters.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
             <Table className="min-w-full">
                <TableHeader className="bg-gray-50/50">
                   <TableRow>
                      <TableHead>Account Detail</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Control</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredRecruiters.map((user) => (
                      <TableRow key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                         <TableCell>
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                  {user.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-bold text-primary">{user.name}</p>
                                  <p className="text-[10px] text-secondary">ID: {user._id.slice(-6)}</p>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                               <Building size={14} className="text-accent" />
                               {user.companyName || 'Not Set'}
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="text-xs text-secondary space-y-1">
                               <p><span className="font-bold text-primary">{user.jobsPosted || 0}</span> jobs posted</p>
                               <p><span className="font-bold text-primary">{user.totalApplicants || 0}</span> total applicants</p>
                               <p>{user.lastJobPostedAt ? `Last post: ${new Date(user.lastJobPostedAt).toLocaleDateString()}` : 'No postings yet'}</p>
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                               <Mail size={12} className="text-accent" />
                               {user.email}
                            </div>
                         </TableCell>
                         <TableCell>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                               {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                         </TableCell>
                         <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                               {user.isBlocked ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 text-green-600 border-green-200 hover:bg-green-50" 
                                    onClick={() => handleAction('unblock', user._id)}
                                  >
                                    <CheckCircle size={14} className="mr-1" /> Unblock
                                  </Button>
                               ) : (
                                  <Button 
                                    variant="danger" 
                                    size="sm" 
                                    className="h-8" 
                                    onClick={() => handleAction('block', user._id)}
                                  >
                                    <Ban size={14} className="mr-1" /> Restrict
                                  </Button>
                               )}
                            </div>
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
          </div>
        ) : (
          <div className="py-20 text-center text-secondary">
             <UserRound size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="font-bold text-lg">No recruiters found.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
