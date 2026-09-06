import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Navbar from './Navbar';

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <div className="flex bg-gray-50/50 flex-1 relative">
        <AdminSidebar />
        <main className="flex-1 w-full min-w-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
