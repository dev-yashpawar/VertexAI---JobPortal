import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { StatusBadge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users,
  ArrowLeft, 
  Loader2, 
  Star, 
  Download, 
  Check, 
  X, 
  Search, 
  Filter, 
  FileText,
  Clock,
  ChevronDown,
  UserCheck,
  UserX,
  StickyNote
} from 'lucide-react';
import api from '../../lib/api';

export default function JobApplicants() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobInfo, setJobInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Notes Modal state
  const [activeNotesId, setActiveNotesId] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchATSData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchATSData = async () => {
    try {
      setLoading(true);
      const jobsRes = await api.get('/recruiter/jobs');
      const job = jobsRes.data.find(j => j._id === jobId);
      setJobInfo(job);

      const res = await api.get(`/recruiter/jobs/${jobId}/applicants`);
      setApplicants(res.data);
    } catch (err) {
      console.error('Fetch ATS Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await api.patch(`/recruiter/applications/${appId}/status`, { status });
      setApplicants(applicants.map(app => app._id === appId ? { ...app, status } : app));
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      await api.patch('/recruiter/applications/bulk-status', { ids: selectedIds, status });
      setApplicants(applicants.map(app => 
        selectedIds.includes(app._id) ? { ...app, status } : app
      ));
      setSelectedIds([]);
    } catch {
      alert('Failed to perform bulk action.');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (appId) => {
    try {
      await api.patch(`/recruiter/applications/${appId}/notes`, { notes: noteText });
      setApplicants(applicants.map(app => app._id === appId ? { ...app, notes: noteText } : app));
      setActiveNotesId(null);
      setNoteText('');
    } catch {
      alert('Failed to save note.');
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplicants.map(app => app._id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(idx => idx !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Link to="/recruiter/jobs">
             <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft size={20} /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Applicant Tracking System</h1>
            <p className="text-secondary text-sm">Managing: <span className="font-bold text-accent">{jobInfo?.title || '...'}</span></p>
          </div>
        </div>

        <div className="flex bg-white p-1.5 border border-border rounded-xl shadow-sm">
           <div className="flex items-center px-4 py-2 border-r border-border gap-2">
              <span className="text-xs font-bold text-secondary uppercase">Score Range</span>
              <span className="text-sm font-bold text-primary">70% - 100%</span>
           </div>
           <div className="flex items-center px-4 py-2 gap-2">
              <span className="text-xs font-bold text-secondary uppercase">Candidates</span>
              <span className="text-sm font-bold text-primary">{applicants.length}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="p-3 bg-white border-border/50 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg"><Users size={18} className="text-blue-600" /></div>
            <div>
               <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Total Applied</p>
               <p className="text-lg font-bold text-primary">{applicants.length}</p>
            </div>
         </Card>
         <Card className="p-3 bg-white border-border/50 flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-lg"><UserCheck size={18} className="text-green-600" /></div>
            <div>
               <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Shortlisted</p>
               <p className="text-lg font-bold text-primary">{applicants.filter(a => a.status === 'shortlisted').length}</p>
            </div>
         </Card>
         <Card className="p-3 bg-white border-border/50 flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg"><UserX size={18} className="text-red-600" /></div>
            <div>
               <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Rejected</p>
               <p className="text-lg font-bold text-primary">{applicants.filter(a => a.status === 'rejected').length}</p>
            </div>
         </Card>
         <Card className="p-3 bg-white border-border/50 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg"><UserCheck size={18} className="text-blue-600" /></div>
            <div>
               <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Accepted</p>
               <p className="text-lg font-bold text-primary">{applicants.filter(a => a.status === 'accepted').length}</p>
            </div>
         </Card>
      </div>

      <Card className="p-4 bg-white border-border/50 shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter by candidate name..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              className="bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent w-full sm:min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Pipeline</option>
              <option value="applied">New Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <div className="flex gap-2">
              <Button 
                 disabled={selectedIds.length === 0} 
                 onClick={() => handleBulkStatusChange('shortlisted')}
                 className="bg-green-600 hover:bg-green-700 h-10 px-4 text-[10px] sm:text-xs font-bold flex-1 sm:flex-initial"
              >
                Shortlist
              </Button>
              <Button
                 disabled={selectedIds.length === 0}
                 onClick={() => handleBulkStatusChange('accepted')}
                 className="bg-blue-600 hover:bg-blue-700 h-10 px-4 text-[10px] sm:text-xs font-bold flex-1 sm:flex-initial"
              >
                Accept
              </Button>
              <Button 
                 disabled={selectedIds.length === 0} 
                 variant="danger" 
                 onClick={() => handleBulkStatusChange('rejected')}
                 className="h-10 px-4 text-[10px] sm:text-xs font-bold flex-1 sm:flex-initial"
              >
                Reject All
              </Button>
            </div>
          </div>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>
        ) : filteredApplicants.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
            <Table className="min-w-[800px] lg:min-w-full">
              <TableHeader className="bg-gray-50/50">
                 <TableRow>
                    <TableHead className="w-10 px-4">
                       <input 
                         type="checkbox" 
                         checked={selectedIds.length === filteredApplicants.length && filteredApplicants.length > 0} 
                         onChange={toggleSelectAll}
                         className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent curso-pointer"
                       />
                    </TableHead>
                    <TableHead className="whitespace-nowrap px-4 font-bold uppercase text-[10px] tracking-wider text-secondary">Rank</TableHead>
                    <TableHead className="whitespace-nowrap px-4 font-bold uppercase text-[10px] tracking-wider text-secondary">Candidate</TableHead>
                    <TableHead className="whitespace-nowrap px-4 font-bold uppercase text-[10px] tracking-wider text-secondary">Final Score / Match</TableHead>
                    <TableHead className="whitespace-nowrap px-4 font-bold uppercase text-[10px] tracking-wider text-secondary">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap px-4 font-bold uppercase text-[10px] tracking-wider text-secondary">Manage Pipeline</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredApplicants.map((app, idx) => (
                    <TableRow key={app._id} className={`${app.status === 'rejected' ? 'grayscale opacity-70' : ''} group hover:bg-gray-50/50 transition-colors`}>
                       <TableCell className="px-4">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(app._id)} 
                            onChange={() => toggleSelectOne(app._id)}
                            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
                          />
                       </TableCell>
                       <TableCell className="font-bold text-xl text-gray-200 select-none px-4">
                          #{idx + 1}
                       </TableCell>
                       <TableCell className="px-4">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center font-bold text-accent text-sm shrink-0">
                                {app.userId?.name?.charAt(0)}
                             </div>
                             <div className="min-w-0">
                                <p className="font-bold text-primary truncate max-w-[150px]">{app.userId?.name}</p>
                                <p className="text-[10px] text-secondary flex items-center gap-1">
                                  <Clock size={10} /> {new Date(app.createdAt).toLocaleDateString()}
                                </p>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell className="px-4">
                          <div className="flex flex-col gap-1.5 min-w-[140px]">
                             <div className="flex justify-between items-center w-full">
                                <span className="text-lg font-bold text-accent">{app.finalScore}%</span>
                                <span className="text-[10px] uppercase font-bold text-secondary">Match</span>
                             </div>
                             <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${app.finalScore}%` }}></div>
                             </div>
                             <div className="flex gap-4 mt-1">
                                <span title="Skill Match" className="text-[9px] font-bold text-primary flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-border">SKILLS {app.breakdown?.skillMatch}%</span>
                                <span title="AI Resume Analysis" className="text-[9px] font-bold text-primary flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-border">AI RESUME {app.breakdown?.aiScore}%</span>
                             </div>
                          </div>
                       </TableCell>
                       <TableCell className="px-4">
                          <StatusBadge status={app.status} />
                       </TableCell>
                       <TableCell className="text-right px-4">
                          <div className="flex flex-col gap-2 items-end">
                             <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                <Button 
                                  onClick={() => handleStatusChange(app._id, 'accepted')} 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-blue-600 hover:text-white border-blue-200"
                                >
                                  <UserCheck size={14} />
                                </Button>
                                <Button 
                                  onClick={() => handleStatusChange(app._id, 'shortlisted')} 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-green-500 hover:text-white border-green-200"
                                >
                                  <Check size={14} />
                                </Button>
                                <Button 
                                  onClick={() => handleStatusChange(app._id, 'rejected')} 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-red-500 hover:text-white border-red-200"
                                >
                                  <X size={14} />
                                </Button>
                                <Button 
                                  onClick={() => { setActiveNotesId(app._id); setNoteText(app.notes || ''); }} 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-lg hover:bg-primary hover:text-white"
                                >
                                  <StickyNote size={14} />
                                </Button>
                             </div>
                             <div className="flex gap-2">
                                {app.userId?.resumeUrl && (
                                  <a href={`http://localhost:5000/${app.userId.resumeUrl}`} target="_blank" rel="noreferrer">
                                    <Button variant="secondary" size="sm" className="h-8 text-[11px] flex gap-1 items-center font-bold px-3">
                                      <Download size={14} /> Resume
                                    </Button>
                                  </a>
                                )}
                             </div>
                          </div>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-32 text-center text-secondary">
             <Filter size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="font-bold text-lg">No applicants found.</p>
             <p className="text-sm">Try resetting filters to see everyone.</p>
          </div>
        )}
      </Card>

      {/* Note taking Modal */}
      {activeNotesId && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
           <Card className="w-full max-w-md p-6 bg-white shadow-2xl animate-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-primary mb-1">Candidate Notes</h3>
              <p className="text-xs text-secondary mb-6">These notes are only visible to the recruitment team.</p>
              
              <textarea 
                className="w-full h-40 border border-border rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-accent bg-gray-50 resize-none mb-6"
                placeholder="Interview outcomes, technical test scores, etc..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />

              <div className="flex gap-4">
                 <Button variant="secondary" className="flex-1" onClick={() => setActiveNotesId(null)}>Close</Button>
                 <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={() => saveNote(activeNotesId)}>Save Findings</Button>
              </div>
           </Card>
         </div>
      )}
    </div>
  );
}
