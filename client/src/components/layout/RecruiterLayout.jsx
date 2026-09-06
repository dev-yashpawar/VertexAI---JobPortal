import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import RecruiterSidebar from './RecruiterSidebar';

export default function RecruiterLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
      <div className="flex bg-gray-50 flex-1 relative min-w-0">
        <RecruiterSidebar />
        <main className="flex-1 w-full min-w-0 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
