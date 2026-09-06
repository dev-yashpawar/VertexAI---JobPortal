import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  User as UserIcon, 
  Mail, 
  Settings as SettingsIcon, 
  Plus, 
  X, 
  CheckCircle2, 
  FileText,
  Zap,
  Loader2,
  TrendingUp,
  ExternalLink,
  Download
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://127.0.0.1:5000';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    skills: user.skills || []
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      skills: user?.skills || []
    });
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        updateUser(res.data);
      } catch (err) {
        console.error('Failed to refresh profile', err);
      }
    };

    fetchProfile();
  }, [updateUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/student/profile', formData);
      updateUser(res.data);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const resumeHref = user?.resumeUrl ? `${API_ORIGIN}/${user.resumeUrl}` : '';
  const resumeFileName = user?.resumeUrl ? user.resumeUrl.split('/').pop() : '';
  const resumeExtension = resumeFileName.includes('.')
    ? resumeFileName.split('.').pop().toUpperCase()
    : 'FILE';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Your Profile</h1>
          <p className="text-secondary mt-1">Manage your identity and career preferences.</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200 animate-in fade-in zoom-in">
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold">Profile Updated</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left: Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 sm:p-6 lg:p-8 border-none shadow-xl shadow-gray-200/50 bg-white">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <SettingsIcon size={20} className="text-accent" /> General Account Settings
            </h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-secondary">Full Name</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-3 text-secondary" />
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-secondary">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-secondary" />
                    <Input 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="pl-10 h-11 bg-gray-50/50 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-secondary">Skills & Expertise</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a skill (e.g. React, Python)" 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="h-11"
                  />
                  <Button type="button" onClick={addSkill} variant="secondary" className="h-11 px-4">
                    <Plus size={20} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="bg-gray-100 text-primary px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-border flex items-center gap-2 group hover:border-accent hover:text-accent transition-colors">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-secondary group-hover:text-accent p-1">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && <p className="text-sm text-secondary italic">No skills added yet. Use the analyzer to auto-extract them!</p>}
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end">
                <Button type="submit" variant="primary" className="w-full sm:w-auto px-10 h-11 font-bold" disabled={loading}>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: AI Insights */}
        <div className="space-y-6">
           <Card className="p-4 sm:p-6 bg-accent text-white border-none shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap size={18} /> AI Career Pulse
              </h3>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Your profile is in the <span className="font-bold text-white underline decoration-white/30 underline-offset-4">Top 15%</span> based on current market demands for your skill density.
              </p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white/70 tracking-wide uppercase">Profile Integrity</span>
                    <span className="font-bold">88%</span>
                 </div>
                 <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[88%]" />
                 </div>
              </div>
              <Link to="/resume" className="mt-8 block">
                <Button variant="secondary" className="w-full bg-white text-accent hover:bg-gray-100 border-none font-bold h-11">
                  Boost with Resume AI
                </Button>
              </Link>
           </Card>

           <Card className="p-4 sm:p-6 bg-white border border-border/50 shadow-sm">
              <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                <FileText size={18} className="text-secondary" /> Resume Status
              </h3>
              {user.resumeUrl ? (
                <div className="space-y-4">
                   <a
                     href={resumeHref}
                     target="_blank"
                     rel="noreferrer"
                     className="bg-gray-50 border border-border p-3 rounded-xl flex items-center gap-3 hover:border-accent hover:bg-white transition-colors"
                   >
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 font-bold text-xs shrink-0">
                        {resumeExtension}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-primary truncate">{resumeFileName || 'Current Resume'}</p>
                         <p className="text-[10px] text-secondary">Click to preview in a new tab</p>
                      </div>
                      <ExternalLink size={16} className="text-secondary shrink-0" />
                   </a>
                   <div className="flex items-center gap-3">
                     <a
                       href={resumeHref}
                       target="_blank"
                       rel="noreferrer"
                       className="text-xs text-accent font-bold hover:underline"
                     >
                       Preview Resume
                     </a>
                     <a
                       href={resumeHref}
                       download={resumeFileName || 'resume'}
                       className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                     >
                       <Download size={12} />
                       Download
                     </a>
                   </div>
                   <Link to="/resume" className="block text-xs text-accent font-bold hover:underline">Replace Resume</Link>
                </div>
              ) : (
                <div className="text-center py-4">
                   <p className="text-xs text-secondary mb-4">No resume uploaded yet.</p>
                   <Link to="/resume" className="block">
                     <Button size="sm" variant="outline" className="w-full text-xs h-10">Upload Now</Button>
                   </Link>
                </div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
}
