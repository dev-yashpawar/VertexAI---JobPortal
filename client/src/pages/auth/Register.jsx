import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Eye, EyeOff, Loader2, Building, GraduationCap, Server } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../../lib/firebase';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import BrandLogo from '../../components/brand/BrandLogo';

const getProviderEmail = (user, providerKey) =>
  user?.email || user?.providerData?.find((entry) => entry.providerId === providerKey)?.email || null;

const getSocialAuthErrorMessage = (err, providerLabel) => {
  const code = err?.code || '';
  if (code === 'auth/popup-closed-by-user') return `${providerLabel} sign-in was canceled.`;
  if (code === 'auth/popup-blocked') return `Popup blocked by the browser. Allow popups and try ${providerLabel} again.`;
  if (code === 'auth/account-exists-with-different-credential') return 'An account already exists with a different sign-in method for this email.';
  if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
    return `${providerLabel} sign-in is not enabled in Firebase for this project yet.`;
  }
  return err?.response?.data?.message || err?.message || `${providerLabel} registration failed`;
};

export default function Register() {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', companyName: '', skills: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get('role');
    if (r && ['student', 'recruiter', 'admin'].includes(r)) {
      setRole(r);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      };

      if (role === 'recruiter') {
        payload.companyName = formData.companyName;
      } else if (role === 'student') {
        payload.skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      const response = await api.post('/auth/register', payload);
      
      const { token, ...userData } = response.data;
      login(userData, token);

      if (userData.role === 'student') navigate('/dashboard');
      else if (userData.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
      const email = getProviderEmail(user, 'google.com');

      if (!email) {
        throw new Error('Google did not return an email address for this account.');
      }
      
      const response = await api.post('/auth/social', {
        name: user.displayName,
        email,
        provider: 'google',
        providerId: user.uid,
        profilePic: user.photoURL,
        role: role,
        companyName: role === 'recruiter' ? formData.companyName : undefined
      });
      
      const { token, ...userData } = response.data;
      login(userData, token);

      if (userData.role === 'student') navigate('/dashboard');
      else if (userData.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
      
    } catch (err) {
      setError(getSocialAuthErrorMessage(err, 'Google'));
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const { user } = result;
      const email = getProviderEmail(user, 'github.com');

      if (!email) {
        throw new Error('GitHub did not return an email address. Make sure your GitHub email is public or available to the OAuth app.');
      }
      
      const response = await api.post('/auth/social', {
        name: user.displayName || email.split('@')[0],
        email,
        provider: 'github',
        providerId: user.uid,
        profilePic: user.photoURL,
        role: role,
        companyName: role === 'recruiter' ? formData.companyName : undefined
      });
      
      const { token, ...userData } = response.data;
      login(userData, token);

      if (userData.role === 'student') navigate('/dashboard');
      else if (userData.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/admin/dashboard');
      
    } catch (err) {
      setError(getSocialAuthErrorMessage(err, 'GitHub'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo
              logoClassName="h-10 w-auto"
              nameClassName="font-bold text-2xl text-primary tracking-tight"
            />
          </Link>
        </div>
        
        <Card className="p-8 shadow-lg border-0 ring-1 ring-border">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">Create an Account</h2>
            <p className="text-secondary text-sm">Join the platform redefining talent acquisition.</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
            <button
              className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition ${role === 'student' ? 'bg-white text-accent shadow-sm ring-1 ring-border' : 'text-secondary hover:text-primary'}`}
              onClick={() => setRole('student')}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition ${role === 'recruiter' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-border' : 'text-secondary hover:text-primary'}`}
              onClick={() => setRole('recruiter')}
            >
              <Building className="w-4 h-4" /> Recruiter
            </button>
          </div>

          {role === 'admin' && (
             <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
               <Server className="w-6 h-6 text-orange-600" />
               <p className="text-sm font-medium text-orange-800">You are creating an Administrator account. System-wide elevated privileges apply.</p>
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">Full Name</label>
                <Input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">Email Address</label>
                <Input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            {role === 'recruiter' && (
              <div className="space-y-1 border-t border-border pt-4 mt-4">
                <label className="text-sm font-medium text-primary">Company Name</label>
                <Input name="companyName" placeholder="e.g. Acme Corp" value={formData.companyName} onChange={handleChange} required />
              </div>
            )}

            {role === 'student' && (
              <div className="space-y-1 border-t border-border pt-4 mt-4">
                <label className="text-sm font-medium text-primary">Initial Skills (Comma separated)</label>
                <Input name="skills" placeholder="e.g. React, Node.js, Python" value={formData.skills} onChange={handleChange} />
                <p className="text-xs text-secondary mt-1">Don't worry, our AI will refine these when you upload a resume later.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4 mt-4">
               <div className="space-y-1">
                 <label className="text-sm font-medium text-primary">Password</label>
                 <Input name="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} required minLength={6} />
               </div>
               <div className="space-y-1">
                 <label className="text-sm font-medium text-primary">Confirm Password</label>
                 <Input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required />
               </div>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-2">
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm text-secondary hover:text-primary flex items-center gap-1 transition">
                 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {showPassword ? 'Hide' : 'Show'} Passwords
               </button>
            </div>

            <Button type="submit" className={`w-full mt-6 h-11 text-base ${role === 'recruiter' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-accent hover:bg-green-700'}`} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Account...</>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-secondary font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="h-12 border-[1.5px] border-border/80 hover:border-accent/50 hover:bg-slate-50 flex items-center justify-center gap-3 transition-all rounded-xl shadow-sm"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {!loading && (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    style={{ fill: '#4285F4' }}
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    style={{ fill: '#34A853' }}
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    style={{ fill: '#FBBC05' }}
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    style={{ fill: '#EA4335' }}
                  />
                </svg>
              )}
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Google'}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              className="h-12 border-[1.5px] border-border/80 hover:border-accent/50 hover:bg-slate-50 flex items-center justify-center gap-3 transition-all rounded-xl shadow-sm"
              onClick={handleGithubLogin}
              disabled={loading}
            >
              {!loading && (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  />
                </svg>
              )}
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'GitHub'}
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-secondary border-t border-border pt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
