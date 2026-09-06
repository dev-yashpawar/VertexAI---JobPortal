import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Zap, 
  ArrowLeft,
  Bookmark,
  Loader2,
  Building
} from 'lucide-react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import useJobStore from '../../store/useJobStore';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toggleSaveJob, savedJobs } = useJobStore();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/student/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error('Failed to fetch job details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [jobId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>;
  if (!job) return <div className="text-center py-20 text-secondary">Job not found</div>;

  const isSaved = savedJobs.some(sj => sj._id === job._id);

  // Match Calc
  const matchedSkills = job.requiredSkills.filter(s => 
    user.skills?.some(us => us.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = job.requiredSkills.filter(s => 
    !user.skills?.some(us => us.toLowerCase() === s.toLowerCase())
  );
  const matchScore = Math.round((matchedSkills.length / job.requiredSkills.length) * 100);

  const handleApply = async () => {
    try {
      setApplying(true);
      await api.post('/student/applications/apply', { jobId: job._id });
      alert('Applied successfully!');
      navigate('/applications');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Search
      </button>

      {/* Header Card */}
      <Card className="p-4 sm:p-6 lg:p-8 border-none shadow-xl shadow-gray-200/50 bg-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border border-border flex items-center justify-center text-accent shrink-0">
              <Building size={32} className="sm:size-10" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight truncate pr-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-secondary font-medium text-xs sm:text-sm">
                <span className="flex items-center gap-1.5"><Building size={14} /> {job.postedBy?.companyName}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap"><Calendar size={14} /> {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <Button 
              onClick={() => toggleSaveJob(job._id)} 
              variant="outline" 
              className={`flex-1 lg:flex-none gap-2 h-11 sm:h-12 ${isSaved ? 'text-accent border-accent bg-accent/5' : ''}`}
            >
              <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} /> {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={applying}
              variant="primary" 
              className="flex-1 lg:flex-none px-6 sm:px-8 font-bold shadow-lg shadow-accent/20 h-11 sm:h-12 text-sm sm:text-base"
            >
              {applying ? <Loader2 className="animate-spin mr-2" /> : <Zap size={18} className="mr-2" />} Apply Now
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Description */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <h2 className="text-xl font-bold text-primary mb-6 border-b border-border pb-4">Job Description</h2>
            <div className="prose prose-gray max-w-none text-secondary leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </Card>
        </div>

        {/* Right: AI Analysis & Details */}
        <div className="space-y-8">
          {/* AI Match Widget */}
          <Card className="p-6 bg-gradient-to-br from-primary to-gray-800 text-white border-none shadow-xl">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <Zap size={18} className="text-yellow-400 fill-yellow-400" /> AI Skills Match
             </h3>
             <div className="flex items-center justify-center py-6 relative">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * matchScore) / 100} strokeLinecap="round" className="text-accent transition-all duration-1000" />
                    </svg>
                    <span className="absolute text-3xl font-black">{matchScore}%</span>
                 </div>
             </div>
             
             <div className="space-y-4">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Matched Skills</p>
                   <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map(s => (
                        <span key={s} className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full border border-accent/20">{s}</span>
                      ))}
                   </div>
                </div>
                {missingSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Missing Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                       {missingSkills.map(s => (
                         <span key={s} className="bg-white/5 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">{s}</span>
                       ))}
                    </div>
                  </div>
                )}
             </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Internship Detail</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                 <span className="text-secondary flex items-center gap-2"><DollarSign size={16} /> Stipend</span>
                 <span className="font-bold text-primary">{job.stipend}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <span className="text-secondary flex items-center gap-2"><Briefcase size={16} /> Category</span>
                 <span className="font-bold text-primary">Technical</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <span className="text-secondary flex items-center gap-2"><MapPin size={16} /> Type</span>
                 <span className="font-bold text-primary">{job.location === 'Remote' ? 'Work from Home' : 'In-Office'}</span>
              </div>
            </div>
            <Link to="/profile">
               <Button variant="outline" size="sm" className="w-full mt-6 text-xs text-accent border-accent/20">
                 Update Profile to Improve Match
               </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
