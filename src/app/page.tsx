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

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await api.get('/issues/global');
        if (res.data.success) {
          setIssues(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch issues", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const handleVote = async (issueId: string, type: 'upvote' | 'downvote') => {
    try {
      const res = await api.post(`/votes/${issueId}/${type}`);
      if (res.data.success) {
        // Optimistically update the vote count locally or refetch
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

  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueDescription, setNewIssueDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim() || !newIssueDescription.trim()) return;
    
    setCreating(true);
    try {
      const res = await api.post('/issues/create', {
        title: newIssueTitle,
        description: newIssueDescription,
      });
      if (res.data.success) {
        setNewIssueTitle('');
        setNewIssueDescription('');
        // Refresh issues
        const fresh = await api.get('/issues/global');
        if (fresh.data.success) setIssues(fresh.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        alert("Failed to create issue.");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex justify-center selection:bg-primary/30">
      <div className="flex w-full gap-8 pt-8 relative">
        {/* Left Sidebar */}
        <aside className="w-[240px] shrink-0 sticky top-[calc(var(--spacing-nav)+32px)] h-[calc(100vh-var(--spacing-nav)-64px)] hidden md:block">
          <ul className="flex flex-col gap-1">
            <li className="flex items-center gap-4 py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 font-medium text-text-main bg-white/[0.05] border border-white/[0.08] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]" onClick={() => router.push('/')}>
              <span className="text-xl opacity-80">🌐</span>
              <span className="tracking-wide">Global Issues</span>
            </li>
            <li className="flex items-center gap-4 py-3 px-4 rounded-xl cursor-pointer transition-all font-medium text-text-muted hover:text-text-main hover:bg-white/5" onClick={() => router.push('/division')}>
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
          {/* Create Post Box */}
          <div className="bg-white/[0.02] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 mb-8 border border-white/[0.08] backdrop-blur-2xl">
            <form onSubmit={handleCreateIssue}>
              <div className="flex gap-4 items-start pb-5 border-b border-white/10 mb-5">
                <div className="w-10 h-10 shrink-0 bg-primary/20 text-primary rounded-xl flex items-center justify-center font-bold border border-primary/30 shadow-sm">U</div>
                <div className="flex-1 flex flex-col gap-3 mt-1">
                  <input 
                    type="text" 
                    placeholder="Issue Title (e.g., Severe Traffic Jam)" 
                    className="w-full bg-transparent border-none text-lg text-text-main placeholder:text-text-muted/60 focus:outline-none font-semibold transition-all" 
                    value={newIssueTitle}
                    onChange={(e) => setNewIssueTitle(e.target.value)}
                    required
                  />
                  <textarea 
                    placeholder="Describe the issue happening in your city..." 
                    className="w-full bg-transparent border-none text-text-main placeholder:text-text-muted/50 focus:outline-none resize-none min-h-[60px] leading-relaxed transition-all" 
                    value={newIssueDescription}
                    onChange={(e) => setNewIssueDescription(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-text-muted/70 text-sm font-medium">
                  <span className="flex items-center gap-2 cursor-not-allowed hover:text-text-muted transition-colors">
                    <span className="text-lg">📷</span> Add Photo
                  </span>
                </div>
                <button 
                  type="submit" 
                  disabled={creating || !newIssueTitle || !newIssueDescription}
                  className="px-6 py-2.5 bg-primary/90 hover:bg-primary text-white font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                >
                  {creating ? 'Posting...' : 'Post Issue'}
                </button>
              </div>
            </form>
          </div>

          {/* Feed List */}
          {loading ? (
            <div className="text-center py-12 text-text-muted animate-pulse">Loading issues...</div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">No issues found. Be the first to post!</div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-white/[0.02] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 mb-6 border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-white/5 text-text-main rounded-xl flex items-center justify-center font-bold border border-white/10">
                    {issue.author?.name ? issue.author.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-text-main tracking-wide">{issue.author?.name || 'Anonymous'}</div>
                    <div className="text-xs text-text-muted mt-0.5 font-medium tracking-wider">
                      {new Date(issue.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} <span className="opacity-50 mx-1">•</span> {issue.district?.name || 'Global'}
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
          <div className="bg-white/[0.02] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 border border-white/[0.08] backdrop-blur-2xl">
            <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-5">Trending Issues</h3>
            <ul className="flex flex-col gap-5">
              <li className="flex gap-4 group cursor-pointer">
                <div className="font-bold text-primary/70 text-lg group-hover:text-primary transition-colors">01</div>
                <div>
                  <div className="font-medium text-sm text-text-main group-hover:text-primary transition-colors">Water Logging in Dhanmondi</div>
                  <div className="text-xs text-text-muted mt-1">450 upvotes</div>
                </div>
              </li>
              <li className="flex gap-4 group cursor-pointer">
                <div className="font-bold text-primary/70 text-lg group-hover:text-primary transition-colors">02</div>
                <div>
                  <div className="font-medium text-sm text-text-main group-hover:text-primary transition-colors">Frequent Power Cuts</div>
                  <div className="text-xs text-text-muted mt-1">320 upvotes</div>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
