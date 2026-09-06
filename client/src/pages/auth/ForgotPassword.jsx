import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, MailCheck } from 'lucide-react';
import api from '../../lib/api';
import BrandLogo from '../../components/brand/BrandLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset email right now.');
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
            <h2 className="text-2xl font-bold text-primary mb-2">Forgot your password?</h2>
            <p className="text-secondary text-sm">
              Enter your account email and we will send a secure reset link.
            </p>
          </div>

          {message ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm flex gap-3">
                <MailCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
              <Button asChild className="w-full h-11 text-base">
                <Link to="/login">Back to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-primary">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-4 h-11 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>

              <div className="text-center text-sm text-secondary border-t border-border pt-6">
                Remembered your password?{' '}
                <Link to="/login" className="font-medium text-accent hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
