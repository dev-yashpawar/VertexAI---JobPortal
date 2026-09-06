import { useState, useEffect } from 'react';
import { JobCard } from '../../components/ui/job-card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Loader2, SlidersHorizontal, Zap, Bookmark, Briefcase } from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import useJobStore from '../../store/useJobStore';

export default function JobsExplorer() {
  const { user, isAuthenticated } = useAuthStore();
  const { jobs, savedJobs, fetchJobs, fetchSavedJobs, loading } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, recommended, saved

  useEffect(() => {
    fetchJobs();
    if (isAuthenticated) fetchSavedJobs();
  }, [isAuthenticated, fetchJobs, fetchSavedJobs]);

  const filteredJobs = (() => {
    let list = [];
    const normalizedUserSkills = (user.skills || []).map((skill) => skill.toLowerCase());
    if (activeTab === 'all') list = jobs;
    if (activeTab === 'saved') list = savedJobs;
    if (activeTab === 'recommended') {
      list = jobs.filter(job => 
        (job.matchScore || 0) >= 70 || 
        job.requiredSkills.some(s => normalizedUserSkills.includes(s.toLowerCase()))
      ).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    const term = searchTerm.toLowerCase();
    return list.filter(job => 
      job.title.toLowerCase().includes(term) || 
      job.postedBy?.companyName?.toLowerCase().includes(term) ||
      job.requiredSkills.some(skill => skill.toLowerCase().includes(term))
    );
  })();

  const handleApply = async (jobId) => {
    if (!isAuthenticated) return alert('Please Login first');
    try {
      await api.post('/student/applications/apply', { jobId });
      alert('Applied successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Jobs', icon: Briefcase },
    { id: 'recommended', label: 'Recommended', icon: Zap },
    { id: 'saved', label: 'Saved', icon: Bookmark },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Explore Opportunities</h1>
          <p className="text-secondary mt-1">Found {filteredJobs.length} opportunities matching your profile.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
           <div className="relative w-full md:w-80 group">
             <Search className="w-5 h-5 absolute left-3 top-2.5 text-secondary group-focus-within:text-accent transition-colors" />
             <Input 
               placeholder="Role, company, or skills..." 
               className="pl-10 h-11 bg-white border-border/60 shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <Button variant="secondary" className="h-11 gap-2 border-border/60">
             <SlidersHorizontal className="w-4 h-4" /> Filters
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative whitespace-nowrap
              ${activeTab === tab.id ? 'text-accent' : 'text-secondary hover:text-primary'}
            `}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-in zoom-in-50" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard key={job._id} job={job} onApply={handleApply} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-gray-50/50 rounded-3xl border border-dashed border-border/60">
           <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-border mx-auto flex items-center justify-center text-gray-300 mb-6">
             <Search size={32} />
           </div>
           <h3 className="text-xl font-bold text-primary">No jobs found</h3>
           <p className="text-secondary mt-2 max-w-sm mx-auto">
             Try adjusting your filters or search term to discover more opportunities.
           </p>
           {activeTab !== 'all' && (
             <Button onClick={() => setActiveTab('all')} variant="outline" className="mt-6">
               Show All Available Jobs
             </Button>
           )}
        </div>
      )}
    </div>
  );
}
