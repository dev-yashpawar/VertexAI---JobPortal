import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import BrandLogo from '../../components/brand/BrandLogo';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError('Reset token is missing. Open the link from your email again.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      setMessage(response.data.message);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
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
            <h2 className="text-2xl font-bold text-primary mb-2">Create a new password</h2>
            <p className="text-secondary text-sm">
              Choose a new password for your VertexJob account.
            </p>
          </div>

          {message ? (
            <div className="space-y-6">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-200">
                {message}
              </div>
              <Button asChild className="w-full h-11 text-base">
                <Link to="/login">Go to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-1 relative">
                <label className="text-sm font-medium text-primary">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-secondary hover:text-primary transition-colors"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">Confirm Password</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full mt-4 h-11 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving new password...
                  </>
                ) : (
                  'Reset password'
                )}
              </Button>

              <div className="text-center text-sm text-secondary border-t border-border pt-6">
                <Link to="/login" className="font-medium text-accent hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
