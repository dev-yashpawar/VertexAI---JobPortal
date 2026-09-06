import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';

export default function SidebarLayout() {
  const { isAuthenticated, user, updateUser } = useAuthStore();

  useEffect(() => {
    const refreshStudentProfile = async () => {
      if (!isAuthenticated || user?.role !== 'student') return;

      try {
        const res = await api.get('/student/profile');
        updateUser(res.data);
      } catch (err) {
        console.error('Failed to refresh student profile', err);
      }
    };

    refreshStudentProfile();
  }, [isAuthenticated, updateUser, user?.role]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <div className="flex bg-background flex-1 relative">
        <Sidebar />
        <main className="flex-1 w-full min-w-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
