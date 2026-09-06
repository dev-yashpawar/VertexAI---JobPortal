import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  Loader2,
  Mail
} from 'lucide-react';
import api from '../../lib/api';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users?role=student');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAction = async (type, id) => {
    try {
      if (type === 'block') await api.patch(`/admin/users/${id}/block`);
      if (type === 'unblock') await api.patch(`/admin/users/${id}/unblock`);
      fetchStudents();
    } catch {
      alert('Action failed.');
    }
  };

  const filteredStudents = students.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'blocked' ? user.isBlocked : !user.isBlocked);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Student Management</h1>
          <p className="text-secondary text-sm">Monitor student activity, where they apply, and how their application outcomes are moving.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border-border/50 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Total Students</p>
          <p className="text-2xl font-bold text-primary mt-2">{students.length}</p>
        </Card>
        <Card className="p-5 bg-white border-border/50 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Students Applied</p>
          <p className="text-2xl font-bold text-primary mt-2">{students.filter((user) => (user.applicationsCount || 0) > 0).length}</p>
        </Card>
        <Card className="p-5 bg-white border-border/50 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Restricted Students</p>
          <p className="text-2xl font-bold text-primary mt-2">{students.filter((user) => user.isBlocked).length}</p>
        </Card>
      </div>

      <Card className="p-4 bg-white border-border/50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
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
             <option value="all">All Students</option>
             <option value="active">Active Applicants</option>
             <option value="blocked">Blocked Accounts</option>
           </select>
        </div>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
             <Table className="min-w-full">
                <TableHeader className="bg-gray-50/50">
                   <TableRow>
                      <TableHead>Student Detail</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Application Activity</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredStudents.map((user) => (
                      <TableRow key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                         <TableCell>
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 uppercase">
                                  {user.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-bold text-primary">{user.name}</p>
                                  <p className="text-[10px] text-secondary">Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                               {user.skills?.slice(0, 3).map((skill, i) => (
                                  <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-secondary rounded uppercase">{skill}</span>
                               ))}
                               {user.skills?.length > 3 && <span className="text-[9px] font-bold text-accent">+{user.skills.length - 3}</span>}
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="text-xs text-secondary space-y-1 max-w-[240px]">
                               <p><span className="font-bold text-primary">{user.applicationsCount || 0}</span> total applications</p>
                               <p><span className="font-bold text-primary">{user.acceptedCount || 0}</span> accepted | <span className="font-bold text-primary">{user.shortlistedCount || 0}</span> shortlisted</p>
                               <p className="truncate">
                                 {user.latestApplication
                                   ? `Latest: ${user.latestApplication.companyName} - ${user.latestApplication.title}`
                                   : 'No applications yet'}
                               </p>
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
                               {user.isBlocked ? 'Blocked' : 'Verified'}
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
                                    className="h-8 shadow-sm"
                                    onClick={() => handleAction('block', user._id)}
                                  >
                                    <Ban size={14} className="mr-1" /> Ban Account
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
             <Users size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="font-bold text-lg">No students found.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
