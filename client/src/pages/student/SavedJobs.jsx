import { useEffect } from 'react';
import { JobCard } from '../../components/ui/job-card';
import { Bookmark, Loader2, Zap } from 'lucide-react';
import useJobStore from '../../store/useJobStore';

export default function SavedJobs() {
  const { savedJobs, fetchSavedJobs, loading } = useJobStore();

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Saved Opportunities</h1>
          <p className="text-secondary mt-1">Found {savedJobs.length} bookmarked roles for you to review.</p>
        </div>
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
           <Bookmark size={24} fill="currentColor" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-gray-50/50 rounded-3xl border border-dashed border-border/60">
           <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-border mx-auto flex items-center justify-center text-gray-300 mb-6">
             <Bookmark size={32} />
           </div>
           <h3 className="text-xl font-bold text-primary">No saved jobs</h3>
           <p className="text-secondary mt-2 max-w-sm mx-auto">
             Roles you bookmark while exploring will appear here for easy access later.
           </p>
        </div>
      )}
    </div>
  );
}
