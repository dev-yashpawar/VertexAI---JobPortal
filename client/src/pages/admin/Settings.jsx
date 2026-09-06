import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Settings as SettingsIcon, 
  Shield, 
  User, 
  Bell, 
  Lock, 
  Mail,
  Globe,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export default function Settings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
     setLoading(true);
     setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
     }, 1000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <SettingsIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">System Settings</h1>
          <p className="text-secondary text-sm">Manage administrative preferences and security protocols.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Sidebar Navigation for Settings */}
         <div className="md:col-span-1 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-xl text-sm font-bold text-primary shadow-sm shadow-primary/5 transition-all">
               <User size={18} className="text-accent" />
               Profile Information
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all">
               <Shield size={18} />
               Security & Access
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all">
               <Bell size={18} />
               System Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-secondary hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all">
               <Globe size={18} />
               Regional & Language
            </button>
         </div>

         {/* Settings Content */}
         <div className="md:col-span-2 space-y-6">
            <Card className="p-6 border-border/50 shadow-sm bg-white">
               <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
                  <User size={18} className="text-accent" />
                  <h3 className="font-bold text-primary">Admin Profile</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">Full Name</label>
                        <input 
                           type="text" 
                           defaultValue={user?.name}
                           className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">Email Address</label>
                        <input 
                           type="email" 
                           defaultValue={user?.email}
                           className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-secondary uppercase tracking-wider">Designation</label>
                     <input 
                        type="text" 
                        defaultValue="System Administrator"
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border border-border rounded-xl text-sm text-secondary cursor-not-allowed"
                     />
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-border/50 shadow-sm bg-white">
               <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
                  <Lock size={18} className="text-accent" />
                  <h3 className="font-bold text-primary">Security Settings</h3>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-secondary uppercase tracking-wider">New Password</label>
                     <div className="relative">
                        <input 
                           type={showPassword ? "text" : "password"} 
                           placeholder="Enter new strong password"
                           className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none pr-10"
                        />
                        <button 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition"
                        >
                           {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
                     <Shield className="w-5 h-5 text-orange-600 shrink-0" />
                     <p className="text-xs leading-relaxed text-orange-800 font-medium">
                        Changing your administrative password will invalidate all active sessions immediately. Ensure Multi-Factor Authentication (MFA) is enabled for maximum safety.
                     </p>
                  </div>
               </div>
            </Card>

            <div className="flex justify-end pt-4">
               <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 flex items-center gap-2 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
               >
                  {loading ? (
                     <Loader2 size={18} className="animate-spin" />
                  ) : success ? (
                     <>
                        <CheckCircle size={18} />
                        All Saved
                     </>
                  ) : (
                     <>
                        <Save size={18} />
                        Save Changes
                     </>
                  )}
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
