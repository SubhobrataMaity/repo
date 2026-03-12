import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { FolderOpen, Star, HelpCircle, BookOpen, Clock, TrendingUp } from 'lucide-react';

interface Stats {
  totalProjects: number;
  selectedWorkCount: number;
  totalFAQs: number;
  totalJournals: number;
  lastProjectTitle: string | null;
  lastProjectDate: string | null;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col gap-4 ${
        accent
          ? 'bg-[#FFD100] border-[#FFD100] text-[#0A0A0A]'
          : 'bg-white/5 border-white/10 text-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-widest ${accent ? 'opacity-60' : 'text-white/40'}`}>
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-[#0A0A0A]/10' : 'bg-white/5'}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-4xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (json.ok) setStats(json.stats);
        else setError(json.error ?? 'Failed to load dashboard');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">Overview of your content</p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderOpen} />
              <StatCard label="Selected Work" value={stats.selectedWorkCount} icon={Star} accent />
              <StatCard label="Total FAQs" value={stats.totalFAQs} icon={HelpCircle} />
              <StatCard label="Journals" value={stats.totalJournals} icon={BookOpen} />
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-[#FFD100]" />
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Last Project Added</span>
                </div>
                <p className="text-white font-semibold text-lg">{stats.lastProjectTitle ?? '—'}</p>
                <p className="text-white/30 text-sm mt-1">{formatDate(stats.lastProjectDate)}</p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-[#FFD100]" />
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Quick Links</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Add New Project', path: '/admin/projects' },
                    { label: 'Manage FAQs', path: '/admin/faq' },
                    { label: 'Write a Journal', path: '/admin/journals' },
                  ].map(link => (
                    <a
                      key={link.path}
                      href={link.path}
                      className="block text-sm text-[#FFD100] hover:text-[#FFD100]/80 transition-colors"
                    >
                      → {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
