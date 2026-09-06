import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserRound, 
  ClipboardList, 
  Flag, 
  BarChart3, 
  Settings,
  X
} from 'lucide-react';
import useLayoutStore from '../../store/useLayoutStore';

const navItems = [
  { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Job Monitoring', path: '/admin/jobs', icon: Briefcase },
  { name: 'Recruiters', path: '/admin/recruiters', icon: UserRound },
  { name: 'Students', path: '/admin/students', icon: Users },
  { name: 'Applications', path: '/admin/applications', icon: ClipboardList },
  { name: 'Fraud Control', path: '/admin/reports', icon: Flag },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const { isSidebarOpen, closeSidebar } = useLayoutStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-[65px] h-[calc(100vh-65px)] bg-white border-r border-border z-40
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-64'}
      `}>
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide p-4">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="font-bold text-primary">Admin Menu</h2>
            <button onClick={closeSidebar}><X size={20} /></button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => closeSidebar()}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-secondary hover:bg-gray-50 hover:text-primary'}
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
