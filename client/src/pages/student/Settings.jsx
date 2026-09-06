import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  BellRing, 
  Smartphone,
  CheckCircle2,
  Loader2,
  Zap
} from 'lucide-react';
import api from '../../lib/api';

export default function Settings() {
  const [passwords, setPasswords] = useState({ next: '', confirm: '' });
  const [settings, setSettings] = useState({ jobRecommendations: true, applicationAlerts: true });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('security');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data } = await api.get('/student/profile');
      if (data.notificationSettings) {
        setSettings(data.notificationSettings);
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
    } finally {
      setFetching(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return alert("Passwords don't match");
    if (passwords.next.length < 6) return alert("Password must be at least 6 characters");
    
    setLoading(true);
    try {
      await api.put('/student/profile', { password: passwords.next });
      setSuccess(true);
      setPasswords({ next: '', confirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newValue = !settings[key];
    const prevSettings = { ...settings };
    
    // Optimistic UI update
    setSettings({ ...settings, [key]: newValue });

    try {
      await api.put('/student/profile', { 
        notificationSettings: { ...settings, [key]: newValue } 
      });
    } catch {
      // Revert on failure
      setSettings(prevSettings);
      alert('Failed to update notification settings');
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Account Settings</h1>
        <p className="text-secondary mt-1">Manage your security and privacy preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Nav */}
        <div className="space-y-1">
           <button 
             onClick={() => setActiveTab('security')}
             className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all border ${activeTab === 'security' ? 'bg-accent/10 text-accent border-accent/20 shadow-sm' : 'text-secondary hover:bg-gray-50 border-transparent'}`}
           >
             Security & Password
           </button>
           <button 
             onClick={() => setActiveTab('privacy')}
             className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all border ${activeTab === 'privacy' ? 'bg-accent/10 text-accent border-accent/20 shadow-sm' : 'text-secondary hover:bg-gray-50 border-transparent'}`}
           >
             Privacy
           </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
           {activeTab === 'security' ? (
             <>
               <Card className="p-8 border-none shadow-xl shadow-gray-200/50 bg-white ring-1 ring-border/5 transition-all duration-300">
                  <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <ShieldCheck size={22} className="text-accent" /> Authentication
                  </h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-secondary">New Password</label>
                          <div className="relative group/input">
                            <Lock size={18} className="absolute left-3 top-3 text-secondary transition-colors group-focus-within/input:text-accent" />
                            <Input 
                              type={showPass ? 'text' : 'password'} 
                              className="pl-10 h-11 transition-all focus:ring-accent/20"
                              value={passwords.next}
                              onChange={(e) => setPasswords({...passwords, next: e.target.value})}
                              required
                              placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-secondary hover:text-primary transition-colors">
                               {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-secondary">Confirm New Password</label>
                          <div className="relative group/input">
                            <Lock size={18} className="absolute left-3 top-3 text-secondary transition-colors group-focus-within/input:text-accent" />
                            <Input 
                              type={showPass ? 'text' : 'password'} 
                              className="pl-10 h-11 transition-all focus:ring-accent/20"
                              value={passwords.confirm}
                              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                              required
                              placeholder="••••••••"
                            />
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4">
                       {success && (
                         <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 animate-in fade-in slide-in-from-left-2 duration-300">
                           <CheckCircle2 size={16} /> 
                           <span className="text-sm font-bold tracking-tight">Password Updated</span>
                         </div>
                       )}
                       <Button type="submit" variant="primary" className="px-8 font-bold ml-auto h-11 bg-accent hover:bg-accent/90 transition-all shadow-md active:scale-95" disabled={loading}>
                          {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                       </Button>
                    </div>
                  </form>
               </Card>

               <Card className="p-8 border-none shadow-xl shadow-gray-200/50 bg-white ring-1 ring-border/5 transition-all duration-300">
                  <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <BellRing size={22} className="text-accent" /> Notification Tuning
                  </h2>
                  <div className="space-y-6">
                     {[
                       { id: 'jobRecommendations', label: 'Job Recommendations', sub: 'Weekly digest based on your search history', icon: Zap },
                       { id: 'applicationAlerts', label: 'Application Status Alerts', sub: 'Real-time updates on your current pipeline', icon: Smartphone },
                     ].map(item => (
                       <div key={item.id} className="flex items-center justify-between group/row">
                          <div className="flex items-start gap-4">
                             <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-secondary border border-border/50 group-hover/row:border-accent/30 group-hover/row:bg-accent/5 transition-all duration-300">
                                <item.icon size={20} className="group-hover/row:text-accent transition-colors" />
                             </div>
                             <div>
                                <p className="text-[15px] font-bold text-primary leading-tight">{item.label}</p>
                                <p className="text-xs text-secondary mt-1 font-medium">{item.sub}</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => handleToggle(item.id)}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 p-1 cursor-pointer outline-none focus:ring-2 focus:ring-accent/20 ${settings[item.id] ? 'bg-accent shadow-inner' : 'bg-gray-200'}`}
                          >
                             <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${settings[item.id] ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                     ))}
                  </div>
               </Card>
             </>
           ) : (
             <Card className="p-8 border-none shadow-xl shadow-gray-200/50 bg-white ring-1 ring-border/5">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                   <ShieldCheck size={22} className="text-accent" /> Privacy & Data Policy
                </h2>
                
                <div className="space-y-6 text-sm text-secondary leading-relaxed">
                   <section className="space-y-2">
                      <h3 className="font-bold text-primary text-base">1. Information We Collect</h3>
                      <p>We collect information you provide directly to us when you create an account, build your profile, and apply for jobs. This include your name, email, skills, and resume data.</p>
                   </section>

                   <section className="space-y-2">
                      <h3 className="font-bold text-primary text-base">2. AI Analysis & Privacy</h3>
                      <p>Your resume data is processed by our AI models to provide match scores and recommendations. We do not sell your personal data to third parties. AI processing is used solely to enhance your job-seeking experience.</p>
                   </section>

                   <section className="space-y-2">
                      <h3 className="font-bold text-primary text-base">3. Your Data Choices</h3>
                      <p>You have full control over your notification settings and profile visibility. You may update or delete your profile data at any time through these settings.</p>
                   </section>

                   <section className="space-y-2">
                      <h3 className="font-bold text-primary text-base">4. Data Security</h3>
                      <p>We implement industry-standard security measures to protect your data from unauthorized access or disclosure. Password data is always cryptographically hashed.</p>
                   </section>

                   <div className="pt-6 border-t border-border/50 text-xs italic">
                      Last updated: March 30, 2026. By using the platform, you agree to our standard terms of service.
                   </div>
                </div>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}
