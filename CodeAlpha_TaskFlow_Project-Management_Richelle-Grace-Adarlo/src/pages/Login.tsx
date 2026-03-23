import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LayoutDashboard, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl animate-fade-in-up">
        <div className="bento-card mb-4 flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskFlow</span>
          </Link>
          <ThemeToggle compact />
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="bento-card p-6 md:col-span-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Back in flow
            </span>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in and continue managing your projects, tasks, and team boards.</p>
          </div>

          <div className="bento-card p-6 md:col-span-3">
            <h2 className="text-xl font-semibold text-foreground mb-1">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground mb-6">Use your credentials to access the dashboard.</p>
            {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 btn-primary rounded-xl disabled:opacity-50 active:scale-[0.98]">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
