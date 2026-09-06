import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useLayoutStore from '../../store/useLayoutStore';
import { Menu, LayoutDashboard, LogOut, Bot } from 'lucide-react';
import RoleAssistantChat from '../chat/RoleAssistantChat';
import BrandLogo from '../brand/BrandLogo';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { toggleSidebar } = useLayoutStore();
  const navigate = useNavigate();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const showAssistant = isAuthenticated && (user?.role === 'student' || user?.role === 'recruiter');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/dashboard';
    if (user.role === 'recruiter') return '/recruiter/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Left: Sidebar Toggle (Mobile Only) & Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-secondary hover:text-primary"
              aria-label="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo
              logoClassName="h-8 sm:h-9 w-auto"
              nameClassName="font-bold text-lg sm:text-xl text-primary tracking-tight"
            />
          </Link>
        </div>

        {/* Center: Desktop Links (Public Only) */}
        {!isAuthenticated && (
          <div className="hidden lg:flex gap-8 items-center font-medium">
            <Link to="/jobs" className="text-secondary hover:text-primary transition-colors">Jobs</Link>
            <a href="/#features" className="text-secondary hover:text-primary transition-colors">Features</a>
            <a href="/#how-it-works" className="text-secondary hover:text-primary transition-colors">How It Works</a>
          </div>
        )}

        {/* Right: Auth Actions */}
        <div className="flex gap-2 sm:gap-4 items-center">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {showAssistant && (
                <button
                  type="button"
                  onClick={() => setAssistantOpen((v) => !v)}
                  className="p-2 rounded-lg border border-border text-secondary hover:text-primary hover:bg-gray-100 transition"
                  aria-label="Open AI assistant"
                  title="Open AI Assistant"
                >
                  <Bot size={18} className="text-accent" />
                </button>
              )}
              <Link 
                to={getDashboardLink()} 
                className="hidden sm:flex items-center gap-2 text-secondary hover:text-primary font-medium transition-colors"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-gray-100 text-primary px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <LogOut size={18} className="sm:hidden" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/login" className="text-primary font-medium hover:text-accent transition-colors px-2 py-1">
                Log in
              </Link>
              <Link 
                to="/register?role=student" 
                className="bg-accent text-white px-4 sm:px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition shadow-sm whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
      {showAssistant && assistantOpen && (
        <div className="fixed right-4 top-20 z-[70] w-[92vw] max-w-md">
          <RoleAssistantChat
            role={user.role}
            onClose={() => setAssistantOpen(false)}
            className="shadow-2xl border-border"
          />
        </div>
      )}
    </nav>
  );
}
