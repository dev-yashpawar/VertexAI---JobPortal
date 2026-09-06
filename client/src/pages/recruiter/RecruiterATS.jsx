import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { StatusBadge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Loader2, Star, Download, ChevronDown, Check, X } from 'lucide-react';
import api from '../../lib/api';

export default function RecruiterATS() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobInfo, setJobInfo] = useState(null);

  // Notes Slideout mock state
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
    } catch (err) {
      console.error('Status Update Error:', err);
      alert('Failed to update candidate status.');
    }
  };

  const saveNote = async (appId) => {
    try {
      await api.patch(`/recruiter/applications/${appId}/notes`, { notes: noteText });
      setApplicants(applicants.map(app => app._id === appId ? { ...app, notes: noteText } : app));
      setActiveNotesId(null);
      setNoteText('');
    } catch (err) {
      console.error('Note Save Error:', err);
      alert('Failed to save notes.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
        <Link to="/recruiter/dashboard">
           <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">ATS Analytics</h1>
          <p className="text-secondary text-sm">Managing pipeline for: <span className="font-bold text-primary">{jobInfo?.title || 'Loading...'}</span></p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-primary flex items-center gap-2">
             <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
             AI Ranked Candidates (Normalized 60/20/20)
           </h3>
           <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{applicants.length} Total Applicants</span>
        </div>

        {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
        ) : applicants.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Final Score</TableHead>
                <TableHead>Score Breakdown</TableHead>
                <TableHead>Pipeline Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((app, index) => (
                <TableRow key={app._id} className={app.status === 'rejected' ? 'opacity-50' : ''}>
                  <TableCell className="font-bold text-2xl text-secondary">#{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-bold text-primary mb-1">{app.userId?.name}</div>
                    <div className="flex gap-1 flex-wrap max-w-xs">
                       {app.userId?.skills?.slice(0, 3).map(s => (
                         <span key={s} className="bg-gray-100 text-[10px] px-2 py-0.5 rounded border border-border">{s}</span>
                       ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="text-xl font-bold text-accent">{app.finalScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-secondary">
                     <div className="grid grid-cols-2 gap-x-2">
                        <span>Skill Match (60%):</span>
                        <span className="font-bold text-primary">{app.breakdown?.skillMatch || 0}%</span>
                        <span>AI Resume (20%):</span>
                        <span className="font-bold text-primary">{app.breakdown?.aiScore || 0}%</span>
                        <span>Profile (20%):</span>
                        <span className="font-bold text-primary">{app.breakdown?.profileScore || 0}%</span>
                     </div>
                  </TableCell>
                  <TableCell>
                     <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col gap-2 items-end">
                       {/* Dropdown proxy using direct buttons for prototype clarity */}
                       {app.status !== 'rejected' && (
                         <div className="flex gap-2">
                           <Button className="bg-blue-600 hover:bg-blue-700" size="sm" onClick={() => handleStatusChange(app._id, 'accepted')}><Check className="w-3 h-3 mr-1"/> Accept</Button>
                           <Button variant="danger" size="sm" onClick={() => handleStatusChange(app._id, 'rejected')}><X className="w-3 h-3 mr-1"/> Reject</Button>
                           {app.status !== 'accepted' && (
                             <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleStatusChange(app._id, 'shortlisted')}><Check className="w-3 h-3 mr-1"/> Shortlist</Button>
                           )}
                         </div>
                       )}
                       <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => { setActiveNotesId(app._id); setNoteText(app.notes || ''); }}>
                            Notes
                          </Button>
                          {app.userId?.resumeUrl && (
                             <a href={`http://localhost:5000/${app.userId.resumeUrl}`} target="_blank" rel="noreferrer">
                                <Button variant="ghost" size="sm"><Download className="w-4 h-4 text-blue-500" /></Button>
                             </a>
                          )}
                       </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-20 text-secondary border border-dashed border-border rounded-xl bg-gray-50">
             <p className="text-lg font-medium">No candidates have applied to this position yet.</p>
          </div>
        )}
      </Card>

      {/* Internal Note Taking UI Overlay (Simplified) */}
      {activeNotesId && (
         <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
           <div className="bg-surface w-full max-w-sm h-full p-6 shadow-xl border-l border-border flex flex-col">
              <h2 className="text-lg font-bold text-primary mb-4">Internal Candidate Notes</h2>
              <textarea 
                className="w-full flex-1 border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-accent resize-none placeholder:text-gray-400"
                placeholder="Leave interview remarks, technical test feedback, etc..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex gap-3 mt-4">
                 <Button variant="secondary" className="flex-1" onClick={() => setActiveNotesId(null)}>Cancel</Button>
                 <Button variant="primary" className="flex-1" onClick={() => saveNote(activeNotesId)}>Save Note</Button>
              </div>
           </div>
         </div>
      )}

    </div>
  );
}
