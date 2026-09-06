import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useLayoutStore from '../../store/useLayoutStore';
import BrandLogo from '../brand/BrandLogo';

const menuItems = [
  { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
  { name: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
  { name: 'Post a Job', path: '/recruiter/jobs/create', icon: PlusCircle },
  { name: 'Applicants', path: '/recruiter/applicants', icon: Users },
  { name: 'Analytics', path: '/recruiter/analytics', icon: BarChart3 },
  { name: 'Notifications', path: '/recruiter/notifications', icon: Bell },
  { name: 'Settings', path: '/recruiter/settings', icon: Settings },
];

export default function RecruiterSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useLayoutStore();
  const navigate = useNavigate();

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
              nameClassName="font-bold text-lg text-primary leading-none tracking-tight"
              subtitle="Recruiter"
              subtitleClassName="text-[10px] text-accent font-bold uppercase tracking-wider mt-1"
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
                  ? 'bg-primary/5 text-primary border-r-2 border-primary' 
                  : 'text-secondary hover:bg-gray-50 hover:text-primary'
                }
              `}
              onClick={() => {
                if (window.innerWidth < 1024) closeSidebar();
              }}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon size={22} className={`transition-colors ${(isCollapsed && window.innerWidth >= 1024) ? 'mx-auto' : ''}`} />
              {(!isCollapsed || window.innerWidth < 1024) && <span className="font-medium text-sm">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
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
