import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        // Redirect to dashboard on successful login
        navigate('/admin/dashboard', { replace: true });
        // Force reload to update Layout Auth state
        window.location.reload();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6" style={{ fontFamily: '"Inter", sans-serif' }}>
      <div className="w-full max-w-md bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#FFD100] flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="6" fill="#0A0A0A" />
              <circle cx="16" cy="16" r="14" stroke="#0A0A0A" strokeWidth="2.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Animatrips</h1>
            <p className="text-white/30 text-sm">Admin Access</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white/60 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FFD100] transition-colors"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD100] text-[#0A0A0A] font-bold text-sm tracking-wide uppercase py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
