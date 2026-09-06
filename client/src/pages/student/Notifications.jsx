import { useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Bell, CheckCircle2, Info, Loader2, X, Trash2 } from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore';

export default function Notifications() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, loading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'application_update': return <CheckCircle2 className="text-green-500" />;
      case 'job_alert': return <Bell className="text-accent" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">System Notifications</h1>
          <p className="text-secondary mt-1">Stay updated with application status and career alerts.</p>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-auto">
           {notifications.some(n => !n.isRead) && (
             <button 
               onClick={markAllAsRead}
               className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-bold hover:bg-accent/20 transition-all shadow-sm"
             >
               <CheckCircle2 size={16} /> Mark all as read
             </button>
           )}
           <div className="w-12 h-12 bg-white border border-border shadow-sm rounded-2xl flex items-center justify-center text-secondary">
              <Bell size={24} />
           </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 gap-4">
          <Loader2 className="animate-spin text-accent w-10 h-10" />
          <p className="text-sm text-secondary font-medium animate-pulse">Fetching your alerts...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {notifications.map((n) => (
            <Card 
              key={n._id} 
              className={`p-6 flex items-start gap-5 transition-all duration-300 relative group overflow-hidden ${
                !n.isRead 
                  ? 'border-l-4 border-l-accent bg-accent/5 shadow-md' 
                  : 'border-border bg-white shadow-sm hover:shadow-md'
              }`}
            >
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                 {getIcon(n.type)}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                     <div className="space-y-1">
                        <h3 className={`font-bold text-lg leading-tight ${!n.isRead ? 'text-primary' : 'text-slate-600'}`}>
                          {n.title}
                        </h3>
                        <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                          {n.message}
                        </p>
                     </div>
                     
                     <div className="flex flex-col items-end gap-3 text-right shrink-0">
                       <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-full uppercase tracking-tight">
                         {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </span>
                       <button 
                         onClick={() => deleteNotification(n._id)}
                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                         title="Remove Notification"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                  </div>

                  {/* Read Action */}
                  {!n.isRead && (
                    <button 
                      onClick={() => markAsRead(n._id)}
                      className="mt-4 text-[10px] font-black text-accent uppercase tracking-widest bg-white hover:bg-accent hover:text-white px-4 py-2 rounded-xl transition-all shadow-sm border border-accent/20 flex items-center gap-2"
                    >
                      <CheckCircle2 size={12} />
                      Acknowledge
                    </button>
                  )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
           <div className="w-24 h-24 bg-white rounded-3xl shadow-xl border border-slate-100 mx-auto flex items-center justify-center text-slate-200 mb-8 relative">
              <Bell size={40} className="animate-bounce duration-1000" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-4 border-white"></div>
           </div>
           <h3 className="text-2xl font-black text-slate-800 tracking-tight">You're up to date!</h3>
           <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium leading-relaxed">
             No new notifications for now. We'll alert you here when recruiters take action or new opportunities arise.
           </p>
           <button 
             onClick={fetchNotifications}
             className="mt-8 text-sm font-bold text-accent hover:underline decoration-2 underline-offset-4"
           >
             Check for updates
           </button>
        </div>
      )}
    </div>
  );
}
