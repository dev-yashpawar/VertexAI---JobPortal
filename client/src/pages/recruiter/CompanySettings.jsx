import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Save, 
  LogOut,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';

export default function CompanySettings() {
  const { user, logout, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      const res = await api.put('/recruiter/profile', formData);
      setUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Company & Account Settings</h1>
          <p className="text-secondary text-sm">Manage your professional identity and workspace security.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={logout} 
          className="text-red-500 border-red-200 hover:bg-red-50 font-bold"
        >
          <LogOut size={16} className="mr-2" /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left Side: General Profile */}
         <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-white border-border/50 shadow-sm">
               <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                     <Building2 className="text-primary w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-primary">Corporation Identity</h3>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                           <User size={14} className="text-accent" /> Recruiter Name
                        </label>
                        <Input 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="h-11 rounded-xl bg-gray-50 border-border/50 font-medium"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                           <Building2 size={14} className="text-accent" /> Company Name
                        </label>
                        <Input 
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="h-11 rounded-xl bg-gray-50 border-border/50 font-medium"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                        <Mail size={14} className="text-accent" /> Business Email
                     </label>
                     <Input 
                       name="email"
                       type="email"
                       value={formData.email}
                       onChange={handleChange}
                       className="h-11 rounded-xl bg-gray-50 border-border/50 font-medium"
                     />
                     <p className="text-[10px] text-gray-400 italic">This email will be visible to applicants who receive your updates.</p>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-50 p-2 rounded-xl">
                           <ShieldCheck className="text-blue-600 w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-primary">Security Update</h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                              <Lock size={14} className="text-accent" /> New Password
                           </label>
                           <Input 
                             name="password"
                             type="password"
                             placeholder="••••••••"
                             value={formData.password}
                             onChange={handleChange}
                             className="h-11 rounded-xl bg-gray-50 border-border/50"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                              <Lock size={14} className="text-accent" /> Confirm Password
                           </label>
                           <Input 
                             name="confirmPassword"
                             type="password"
                             placeholder="••••••••"
                             value={formData.confirmPassword}
                             onChange={handleChange}
                             className="h-11 rounded-xl bg-gray-50 border-border/50"
                           />
                        </div>
                     </div>
                  </div>

                  {error && (
                     <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 text-sm">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                     </div>
                  )}

                  <div className="pt-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        {success && (
                           <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-in slide-in-from-left duration-300">
                             <CheckCircle2 size={16} /> Profile Updated
                           </span>
                        )}
                     </div>
                     <Button 
                       type="submit" 
                       disabled={loading}
                       className="bg-primary hover:bg-primary/90 h-12 px-10 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                     >
                       {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                         <><Save size={18} /> Save Workspace Settings</>
                       )}
                     </Button>
                  </div>
               </form>
            </Card>
         </div>

         {/* Right Side: Quick Stats / Meta */}
         <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-xl">
               <h3 className="font-bold mb-4 opacity-80 uppercase text-[10px] tracking-widest text-accent">Recruiter ID</h3>
               <p className="font-mono text-sm break-all mb-6">{user?._id}</p>
               
               <h3 className="font-bold mb-4 opacity-80 uppercase text-[10px] tracking-widest text-accent">Workspace Role</h3>
               <p className="font-bold text-xl flex items-center gap-2">
                  <ShieldCheck className="text-green-400" /> Professional Recruiter
               </p>
               <hr className="my-6 border-white/10" />
               <p className="text-xs text-white/50 leading-relaxed font-italic">
                 Last profile synchronization: <b>Today</b>
               </p>
            </Card>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
               <h4 className="font-bold text-blue-900 mb-2 truncate">Professional Branding</h4>
               <p className="text-xs text-blue-800/80 leading-relaxed mb-4">
                 Keep your company name and email updated. This data appears on every job posting and automated email sent by the platform.
               </p>
               <Button variant="outline" className="w-full text-xs font-bold border-blue-200 text-blue-700">Explore Guidelines</Button>
            </div>
         </div>
      </div>
    </div>
  );
}
