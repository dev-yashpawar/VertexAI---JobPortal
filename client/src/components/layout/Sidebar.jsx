import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileCheck, 
  Bookmark, 
  User, 
  FileSearch, 
  Bell, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useLayoutStore from '../../store/useLayoutStore';
import useNotificationStore from '../../store/useNotificationStore';
import BrandLogo from '../brand/BrandLogo';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Applications', path: '/applications', icon: FileCheck },
  { name: 'Saved Jobs', path: '/saved', icon: Bookmark },
  { name: 'Resume Analyzer', path: '/resume', icon: FileSearch },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useLayoutStore();

  const { unreadCount, fetchNotifications } = useNotificationStore();
  
  // Fetch notifications on mount
  useEffect(() => {
    if (user) fetchNotifications();
    
    // Optional: Polling every 60 seconds
    const interval = setInterval(() => {
      if (user) fetchNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    closeSidebar();
  }, [closeSidebar]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />

      <aside className={`
        fixed inset-y-0 left-0 bg-white border-r border-border transition-all duration-300 flex flex-col h-screen z-50
        lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64 w-64'}
      `}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <BrandLogo
              logoClassName="h-8 w-auto"
              nameClassName="font-bold text-xl text-primary font-display tracking-tight"
            />
          )}
          
          {/* Collapse Toggle (Desktop) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-gray-50 text-secondary hover:text-primary transition-colors border border-border"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Close Button (Mobile) */}
          <button 
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg bg-gray-50 text-secondary hover:text-primary transition-colors border border-border"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                ${isActive 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-secondary hover:bg-gray-50 hover:text-primary'
                }
              `}
              onClick={() => {
                if (window.innerWidth < 1024) closeSidebar();
              }}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon size={22} className={`transition-colors ${(isCollapsed && window.innerWidth >= 1024) ? 'mx-auto' : ''}`} />
              {(!isCollapsed || window.innerWidth < 1024) && (
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm">{item.name}</span>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
              {isCollapsed && window.innerWidth >= 1024 && item.name === 'Notifications' && unreadCount > 0 && (
                <div className="absolute top-2 right-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* AI Credits Widget */}
        {user?.role === 'student' && (
          <div className="px-6 py-4 border-t border-border">
            {isCollapsed ? (
               <div className="flex justify-center text-accent/80" title={`AI Credits: ${user?.aiCredits || 0}/10`}>
                 <Zap size={20} fill="currentColor" />
               </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl p-4 border border-blue-100/50 shadow-sm animate-in zoom-in-95 duration-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-accent" fill="currentColor" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Credits</span>
                  </div>
                  <span className="text-xs font-black text-accent">{user?.aiCredits?.toFixed(1) || 0} / 10</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-1000 ease-out"
                    style={{ width: `${(user?.aiCredits || 0) * 10}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-medium">Daily allowance resets in 24h</p>
              </div>
            )}
          </div>
        )}

        {/* Footer / Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger hover:bg-danger/5 transition-all group"
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={22} className={(isCollapsed && window.innerWidth >= 1024) ? 'mx-auto' : ''} />
            {(!isCollapsed || window.innerWidth < 1024) && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
