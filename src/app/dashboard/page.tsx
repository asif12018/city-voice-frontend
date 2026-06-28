'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserDashboard {
  id: string;
  name: string;
  email: string;
  role: string;
  issues: any[];
}

export default function Dashboard() {
  const [user, setUser] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to load profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex justify-center selection:bg-primary/30">
      <div className="flex w-full gap-8 pt-8 relative">
        {/* Left Sidebar */}
        <aside className="w-[240px] shrink-0 sticky top-[calc(var(--spacing-nav)+32px)] h-[calc(100vh-var(--spacing-nav)-64px)] hidden md:block">
          <ul className="flex flex-col gap-1">
            <li className="flex items-center gap-4 py-3 px-4 rounded-xl cursor-pointer transition-all font-medium text-text-muted hover:text-text-main hover:bg-white/5" onClick={() => router.push('/')}>
              <span className="text-xl opacity-80">🌐</span>
              <span className="tracking-wide">Global Issues</span>
            </li>
            <li className="flex items-center gap-4 py-3 px-4 rounded-xl cursor-pointer transition-all font-medium text-text-muted hover:text-text-main hover:bg-white/5" onClick={() => router.push('/division')}>
              <span className="text-xl opacity-80">📍</span>
              <span className="tracking-wide">My Division</span>
            </li>
            <li className="flex items-center gap-4 py-3 px-4 rounded-xl cursor-pointer transition-all font-medium text-text-main bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]" onClick={() => router.push('/dashboard')}>
              <span className="text-xl opacity-80">📊</span>
              <span className="tracking-wide">Dashboard</span>
            </li>
          </ul>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 max-w-[640px] w-full pb-12">
          {loading ? (
            <div className="text-center py-12 text-text-muted animate-pulse">Loading profile...</div>
          ) : error ? (
            <div className="text-center p-8 text-danger bg-surface rounded-2xl border border-white/5">{error}</div>
          ) : user ? (
            <>
              {/* Profile Overview Card */}
              <div className="bg-surface rounded-2xl shadow-xl p-8 mb-8 border border-white/5 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left backdrop-blur-sm">
                <div className="w-24 h-24 bg-primary/20 text-primary rounded-2xl flex items-center justify-center font-bold text-4xl border border-primary/30 shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 mt-2">
                  <h1 className="text-3xl font-bold text-text-main tracking-tight">{user.name || 'Anonymous User'}</h1>
                  <p className="text-text-muted mt-1">{user.email}</p>
                  
                  <div className="flex flex-wrap gap-3 mt-5 justify-center sm:justify-start">
                    <span className="px-4 py-1.5 bg-white/5 text-text-main border border-white/10 rounded-full text-sm font-medium">
                      Role: {user.role}
                    </span>
                  </div>
                </div>
                <div>
                   <button 
                    onClick={() => {
                      api.post('/auth/logout').finally(() => {
                         router.push('/login')
                      })
                    }}
                    className="px-6 py-2.5 bg-danger/10 text-danger hover:bg-danger hover:text-white border border-danger/20 transition-all font-medium rounded-full mt-4 sm:mt-0 shadow-sm"
                  >
                    Log Out
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-5 text-text-main tracking-tight">Your Posted Issues ({user.issues?.length || 0})</h2>
              
              {/* Feed List */}
              {(!user.issues || user.issues.length === 0) ? (
                <div className="text-center py-12 text-text-muted bg-surface rounded-2xl border border-white/5">You haven't posted any issues yet.</div>
              ) : (
                user.issues.map((issue: any) => (
                  <div key={issue.id} className="bg-surface rounded-2xl shadow-lg p-6 mb-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start mb-5">
                       <div className="text-xs text-text-muted font-medium tracking-wider">
                          {new Date(issue.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                       </div>
                    </div>
                    <div className="mb-2">
                      <h3 className="text-xl font-bold mb-3 text-text-main tracking-tight">{issue.title}</h3>
                      <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{issue.description}</p>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
