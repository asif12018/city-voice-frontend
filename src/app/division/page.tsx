'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Issue {
  id: string;
  title: string;
  description: string;
  images: string[];
  _count: {
    upvotes: number;
    downvotes: number;
  };
  createdAt: string;
  author: {
    name: string;
  };
  district?: {
    name: string;
  };
}

export default function DivisionFeed() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDivisionIssues = async () => {
      try {
        const res = await api.get('/issues/division');
        if (res.data.success) {
          setIssues(res.data.data);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch division issues.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDivisionIssues();
  }, [router]);

  const handleVote = async (issueId: string, type: 'upvote' | 'downvote') => {
    try {
      const res = await api.post(`/votes/${issueId}/${type}`);
      if (res.data.success) {
        setIssues(prevIssues => prevIssues.map(issue => {
          if (issue.id === issueId) {
            return {
              ...issue,
              _count: {
                ...issue._count,
                upvotes: type === 'upvote' ? (issue._count?.upvotes || 0) + 1 : (issue._count?.upvotes || 0),
                downvotes: type === 'downvote' ? (issue._count?.downvotes || 0) + 1 : (issue._count?.downvotes || 0),
              }
            };
          }
          return issue;
        }));
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        alert("Failed to vote. You might have already voted.");
      }
    }
  };

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
            <li className="flex items-center gap-4 py-3 px-4 rounded-xl cursor-pointer transition-all font-medium text-text-main bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]" onClick={() => router.push('/division')}>
              <span className="text-xl opacity-80">📍</span>
              <span className="tracking-wide">My Division</span>
            </li>
            <li className="flex items-center gap-4 py-3 px-4 rounded-xl cursor-pointer transition-all font-medium text-text-muted hover:text-text-main hover:bg-white/5" onClick={() => router.push('/dashboard')}>
              <span className="text-xl opacity-80">📊</span>
              <span className="tracking-wide">Dashboard</span>
            </li>
          </ul>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 max-w-[640px] w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Division Feed</h1>
            <p className="text-sm text-text-muted mt-1">Issues specific to your local division.</p>
          </div>

          {/* Feed List */}
          {loading ? (
            <div className="text-center py-12 text-text-muted animate-pulse">Loading issues...</div>
          ) : error ? (
            <div className="text-center p-8 text-danger bg-surface rounded-xl border border-border">{error}</div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-surface rounded-2xl border border-white/5">No local issues found. Post one in the Global Feed!</div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-surface rounded-2xl shadow-lg p-6 mb-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-white/5 text-text-main rounded-xl flex items-center justify-center font-bold border border-white/10">
                    {issue.author?.name ? issue.author.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-text-main tracking-wide">{issue.author?.name || 'Anonymous'}</div>
                    <div className="text-xs text-text-muted mt-0.5 font-medium tracking-wider">
                      {new Date(issue.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} <span className="opacity-50 mx-1">•</span> {issue.district?.name || 'Local'}
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-text-main tracking-tight">{issue.title}</h3>
                  <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{issue.description}</p>
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => handleVote(issue.id, 'upvote')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-text-muted font-medium text-sm transition-all hover:bg-white/10 hover:text-text-main border border-transparent hover:border-white/10"
                  >
                    <span>👍</span> <span>{issue._count?.upvotes ?? 0}</span>
                  </button>
                  <button 
                    onClick={() => handleVote(issue.id, 'downvote')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-text-muted font-medium text-sm transition-all hover:bg-white/10 hover:text-text-main border border-transparent hover:border-white/10"
                  >
                    <span>👎</span> <span>{issue._count?.downvotes ?? 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-[280px] shrink-0 sticky top-[calc(var(--spacing-nav)+32px)] h-[calc(100vh-var(--spacing-nav)-64px)] hidden lg:block">
          <div className="bg-surface rounded-2xl shadow-lg p-6 border border-white/5">
            <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-5">Division Trending</h3>
            <ul className="flex flex-col gap-5">
              <li className="flex gap-4 group cursor-pointer">
                <div className="font-bold text-primary/70 text-lg group-hover:text-primary transition-colors">01</div>
                <div>
                  <div className="font-medium text-sm text-text-main group-hover:text-primary transition-colors">Local Road Repair</div>
                  <div className="text-xs text-text-muted mt-1">210 upvotes</div>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
