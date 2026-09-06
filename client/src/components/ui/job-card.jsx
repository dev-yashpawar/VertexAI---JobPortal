import { Button } from "./button"
import { Bookmark, Briefcase, ChevronRight, Zap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import useJobStore from "../../store/useJobStore"
import { useState } from "react"
import useAuthStore from "../../store/useAuthStore"

export function JobCard({ job, onApply }) {
  const { toggleSaveJob, savedJobs } = useJobStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const isSaved = savedJobs.some(sj => sj._id === job._id);
  const [saving, setSaving] = useState(false);

  const requiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const userSkills = Array.isArray(user?.skills) ? user.skills : [];
  const matchedSkillsCount = requiredSkills.filter((skill) =>
    userSkills.some((userSkill) => userSkill.toLowerCase() === String(skill).toLowerCase())
  ).length;
  const computedMatchScore = requiredSkills.length
    ? Math.round((matchedSkillsCount / requiredSkills.length) * 100)
    : 0;
  const matchScore = typeof job.matchScore === 'number' ? job.matchScore : computedMatchScore;

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setSaving(true);
      await toggleSaveJob(job._id);
    } finally {
      setSaving(false);
    }
  };

  const handleDetails = () => {
    if (!isAuthenticated) {
      alert('Please login first to view job details');
      navigate('/login');
      return;
    }
    navigate(`/jobs/${job._id}`);
  };

  const handleApply = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login first to apply');
      navigate('/login');
      return;
    }
    if (onApply) {
      onApply(job._id);
    } else {
      navigate(`/jobs/${job._id}`);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all group flex flex-col h-full ring-1 ring-border/50 shadow-sm shadow-gray-100">
      <div className="flex justify-between items-start mb-4">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-border flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              <Briefcase size={22} />
            </div>
            <div>
               <h3 className="text-lg font-bold text-primary tracking-tight line-clamp-1">{job.title}</h3>
               <p className="text-secondary text-sm font-medium">{job.postedBy?.companyName || 'Top Tier Corp'}</p>
            </div>
         </div>
         <button 
           onClick={handleSave}
           disabled={saving}
           className={`p-2 rounded-xl border transition-all ${isSaved ? 'bg-accent/10 border-accent text-accent' : 'bg-white border-border text-secondary hover:text-primary hover:border-primary'}`}
         >
           <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
         </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {requiredSkills.slice(0, 3).map((skill, index) => (
          <span key={index} className="bg-gray-50 text-secondary px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border/40">
            {skill}
          </span>
        ))}
        {requiredSkills.length > 3 && (
          <span className="text-[10px] font-bold text-accent py-1 px-1">+{requiredSkills.length - 3} more</span>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-dashed border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <div className="flex flex-col">
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest flex items-center gap-1">
                <Zap size={10} className="text-yellow-500 fill-yellow-500" /> AI Match
              </span>
              <span className={`font-black text-xl leading-none ${matchScore >= 80 ? 'text-accent' : 'text-yellow-600'}`}>
                {matchScore}%
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
             <Button
               type="button"
               onClick={handleDetails}
               variant="ghost"
               size="sm"
               className="flex-1 sm:flex-initial w-full text-accent hover:bg-accent/5 font-bold text-xs gap-1 px-3 h-9"
             >
               Details <ChevronRight size={14} />
             </Button>
             <Button
               type="button"
               onClick={handleApply}
               variant="primary"
               size="sm"
               className="flex-1 sm:flex-initial font-bold h-9 text-xs shadow-md shadow-accent/20"
             >
               Apply Now
             </Button>
        </div>
      </div>
    </div>
  );
}
