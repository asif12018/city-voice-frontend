'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const token = res.data.token || res.data.data?.token || res.data.data?.accessToken;
        if (token) localStorage.setItem('token', token);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-center items-center p-4 selection:bg-primary/30">
      <div className="w-full max-w-md bg-white/[0.02] p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/[0.08] backdrop-blur-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl shadow-lg border border-primary/30 mb-4">
            CV
          </div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Welcome Back</h1>
          <p className="text-text-muted mt-2 font-medium">Sign in to City Voice</p>
        </div>

        {error && <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl text-center font-medium">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-black/20 border border-white/10 px-5 py-3.5 rounded-xl text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-black/20 border border-white/10 px-5 py-3.5 rounded-xl text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-primary/90 text-white font-semibold rounded-xl hover:bg-primary transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-sm text-text-muted">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-hover font-semibold transition-colors hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
