import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  HelpCircle,
  BookOpen,
  ChevronRight,
  Menu,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',  path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Projects',   path: '/admin/projects',  icon: FolderOpen      },
  { label: 'FAQ',        path: '/admin/faq',        icon: HelpCircle      },
  { label: 'Journals',   path: '/admin/journals',   icon: BookOpen        },
];

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => res.json())
      .then(data => {
        if (!data.ok || !data.authenticated) {
          navigate('/admin/login', { replace: true });
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        navigate('/admin/login', { replace: true });
      });
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FFD100] border-t-transparent flex rounded-full animate-spin"></div>
      </div>
    );
  }

  const Sidebar = (
    <aside className="flex flex-col h-full bg-[#111] border-r border-white/5 w-64">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FFD100] flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="6" fill="#0A0A0A" />
            <circle cx="16" cy="16" r="14" stroke="#0A0A0A" strokeWidth="2.5" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-tight">Animatrips</p>
          <p className="text-white/30 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#FFD100] text-[#0A0A0A]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 z-30">
        {Sidebar}
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 flex flex-col">{Sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-20 bg-[#111] border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-bold text-sm">Admin Panel</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
