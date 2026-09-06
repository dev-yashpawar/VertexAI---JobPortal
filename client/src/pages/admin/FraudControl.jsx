import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { 
  Flag, 
  Search, 
  Loader2,
  AlertTriangle,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import api from '../../lib/api';

export default function FraudControl() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this report as resolved?')) return;
    try {
      await api.patch(`/admin/reports/${id}/resolve`);
      fetchReports();
    } catch {
      alert('Action failed.');
    }
  };

  const filteredReports = reports.filter(report => 
    report.reportedBy?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Fraud Control</h1>
          <p className="text-secondary text-sm">Managing flagged job listings and user reports to protect platform integrity.</p>
        </div>
      </div>

      <Card className="p-4 bg-white border-border/50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by reporter or reason..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>
        ) : filteredReports.length > 0 ? (
          <div className="overflow-x-auto scrollbar-hide">
             <Table className="min-w-full">
                <TableHeader className="bg-gray-50/50">
                   <TableRow>
                      <TableHead>Reporting Source</TableHead>
                      <TableHead>Reason / Complaint</TableHead>
                      <TableHead>Object Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredReports.map((report) => (
                      <TableRow key={report._id} className="hover:bg-gray-50/50 transition-colors group">
                         <TableCell>
                            <div>
                               <p className="font-bold text-primary text-sm">{report.reportedBy?.name}</p>
                               <div className="flex items-center gap-1.5 text-[10px] text-secondary font-medium">
                                  <Mail size={10} className="text-accent" />
                                  {report.reportedBy?.email}
                               </div>
                            </div>
                         </TableCell>
                         <TableCell>
                            <p className="text-sm font-medium text-primary leading-snug max-w-[300px]">{report.reason}</p>
                            <div className="flex items-center gap-1 text-[10px] text-secondary mt-1">
                               <Clock size={10} /> {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                         </TableCell>
                         <TableCell>
                            <div className="flex flex-col gap-1">
                               <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-600 rounded-md border border-red-100 uppercase tracking-tighter w-fit">
                                  Job Posting
                               </span>
                               <p className="text-xs font-bold text-primary truncate max-w-[150px]">{report.jobId?.title}</p>
                            </div>
                         </TableCell>
                         <TableCell>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${report.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                               {report.status}
                            </span>
                         </TableCell>
                         <TableCell className="text-right">
                             {report.status !== 'resolved' && (
                                <Button 
                                  size="sm" 
                                  className="h-8 bg-primary hover:bg-primary/90 opacity-0 group-hover:opacity-100" 
                                  onClick={() => handleResolve(report._id)}
                                >
                                  <CheckCircle size={14} className="mr-1" /> Resolve
                                </Button>
                             )}
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
          </div>
        ) : (
          <div className="py-20 text-center text-secondary">
             <AlertTriangle size={48} className="mx-auto mb-4 text-gray-200" />
             <p className="font-bold text-lg">No active flags or reports.</p>
             <p className="text-sm">Safety protocols are currently working as intended.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
