import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Bell, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import api from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {
      console.error('Fetch Notifications Error:');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      console.error('Mark Read Error:');
    }
  };

  const clearAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch {
      alert('Failed to clear notifications.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Recruiter Alerts</h1>
          <p className="text-secondary text-sm">Real-time updates on candidate applications and hiring statuses.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={fetchNotifications} className="h-9">Refresh</Button>
           <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 text-red-500 hover:bg-red-50">Clear All</Button>
        </div>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm bg-white">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 size={32} className="animate-spin text-accent" /></div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-border/50">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-4 sm:p-6 transition-colors flex gap-3 sm:gap-4 group ${notif.isRead ? 'bg-white opacity-60' : 'bg-accent/5'}`}
              >
                <div className={`mt-1 p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center ${notif.type === 'job_alert' ? 'bg-blue-100 text-blue-600' : 'bg-accent/10 text-accent'}`}>
                   {notif.type === 'job_alert' ? <Briefcase size={18} /> : <Bell size={18} />}
                </div>
                
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <h3 className={`font-bold transition-all text-sm sm:text-base pr-8 sm:pr-0 truncate ${notif.isRead ? 'text-secondary' : 'text-primary'}`}>{notif.title}</h3>
                    <span className="text-[10px] text-secondary font-bold flex items-center gap-1 uppercase tracking-tighter shrink-0">
                       <Clock size={12} className="text-accent" /> {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">{notif.message}</p>
                </div>

                <div className="shrink-0 flex items-center relative">
                   {!notif.isRead && (
                     <button 
                       onClick={() => markAsRead(notif._id)}
                       className="p-2 -mr-2 rounded-lg hover:bg-accent/10 text-accent sm:opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0 sm:static"
                       title="Mark as Read"
                     >
                       <CheckCircle2 size={20} />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center text-secondary">
             <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
                <Bell size={40} className="text-gray-300" />
             </div>
             <p className="font-bold text-lg">No notifications yet.</p>
             <p className="text-sm">We'll alert you here when new candidates apply or status changes occur.</p>
          </div>
        )}
      </Card>
      
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
         <AlertCircle size={20} className="text-blue-600 shrink-0" />
         <p className="text-xs text-blue-800 leading-tight">
            <b>Pro Tip:</b> Notifications help you respond faster to top-tier candidates. Aim to review new applicants within 24 hours for best results.
         </p>
      </div>
    </div>
  );
}
