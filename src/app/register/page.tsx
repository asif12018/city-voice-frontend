'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Division {
  id: string;
  name: string;
  districts: District[];
}

interface District {
  id: string;
  name: string;
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'MALE',
    divisionId: '',
    districtId: ''
  });
  
  const [locations, setLocations] = useState<Division[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        if (res.data.success) {
          setLocations(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load locations", err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // When division changes, update available districts
    if (name === 'divisionId') {
      const selectedDivision = locations.find(d => d.id === value);
      setAvailableDistricts(selectedDivision ? selectedDivision.districts : []);
      setFormData(prev => ({ ...prev, districtId: '' }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const token = res.data.token || res.data.data?.token || res.data.data?.accessToken;
        if (token) localStorage.setItem('token', token);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-center items-center p-4 selection:bg-primary/30">
      <div className="w-full max-w-xl bg-white/[0.02] p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/[0.08] backdrop-blur-2xl my-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl mx-auto flex items-center justify-center font-bold text-2xl shadow-lg border border-primary/30 mb-4">
            CV
          </div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">Create Account</h1>
          <p className="text-text-muted mt-2 font-medium">Join the City Voice community</p>
        </div>

        {error && <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl text-center font-medium">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full bg-black/20 border border-white/10 px-5 py-3.5 rounded-xl text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                className="w-full bg-black/20 border border-white/10 px-5 py-3.5 rounded-xl text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-black/20 border border-white/10 px-5 py-3.5 rounded-xl text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5 ml-1">Gender</label>
              <select 
                className="w-full bg-black/20 border border-white/10 px-5 py-3.5 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="MALE" className="bg-surface text-text-main">Male</option>
                <option value="FEMALE" className="bg-surface text-text-main">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5 ml-1">Division</label>
              <select 
                className="w-full bg-black/20 border border-white/10 px-5 py-3.5 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                name="divisionId"
                value={formData.divisionId}
                onChange={handleChange}
                required
                disabled={loadingLocations}
              >
                <option value="" disabled className="bg-surface text-text-muted">Select Division</option>
                {locations.map(div => (
                  <option key={div.id} value={div.id} className="bg-surface text-text-main">{div.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-main mb-1.5 ml-1">District</label>
              <select 
                className="w-full bg-black/20 border border-white/10 px-5 py-3.5 rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                value={formData.districtId}
                onChange={(e) => setFormData({...formData, districtId: e.target.value})}
                required
                disabled={!formData.divisionId}
              >
                <option value="" disabled className="bg-surface text-text-muted">Select District</option>
                {availableDistricts.map(dist => (
                  <option key={dist.id} value={dist.id} className="bg-surface text-text-main">{dist.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || loadingLocations}
            className="w-full py-3.5 mt-4 bg-primary/90 text-white font-semibold rounded-xl hover:bg-primary transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover font-semibold transition-colors hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
