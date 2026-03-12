import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Journal {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const EMPTY = { title: '', content: '' };

export default function AdminJournals() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Journal | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/journals', { credentials: 'include' });
      const json = await res.json();
      if (json.ok) setJournals(json.data ?? []);
      else setError(json.error ?? 'Failed to load journals');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setFormError('');
    setShowForm(true);
  }

  function openEdit(j: Journal) {
    setEditing(j);
    setForm({ title: j.title, content: j.content });
    setFormError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const url = editing ? `/api/admin/journals/${editing.id}` : '/api/admin/journals';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.ok) { setShowForm(false); load(); }
      else setFormError(json.error ?? 'Save failed');
    } catch {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/journals/${id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (json.ok) { setDeleteConfirm(null); load(); }
      else setError(json.error ?? 'Delete failed');
    } catch {
      setError('Network error');
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Journals</h1>
            <p className="text-white/40 text-sm mt-1">
              {journals.length} entries · Frontend rendering coming soon
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFD100] text-[#0A0A0A] rounded-xl font-bold text-sm hover:bg-[#FFD100]/90 transition-colors"
          >
            <Plus size={18} /> Write Entry
          </button>
        </div>

        {/* Notice */}
        <div className="mb-6 px-5 py-3.5 rounded-xl bg-[#FFD100]/10 border border-[#FFD100]/20 text-[#FFD100] text-sm">
          📝 Journals are backend-only for now. Frontend rendering will be implemented in a future update.
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p className="text-lg mb-2">No journal entries yet</p>
            <p className="text-sm">Click "Write Entry" to create your first journal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {journals.map(j => (
              <div
                key={j.id}
                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:border-white/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{j.title}</p>
                  <p className="text-white/30 text-xs mt-1">{formatDate(j.created_at)}</p>
                  {j.content && (
                    <p className="text-white/40 text-xs mt-2 line-clamp-2 leading-relaxed">{j.content}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(j)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === j.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(j.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#161616] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-white font-bold">{editing ? 'Edit Journal Entry' : 'New Journal Entry'}</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>
                )}

                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Journal title..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFD100] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Content</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Write your journal entry..."
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFD100] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-white/50 hover:text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-[#FFD100] text-[#0A0A0A] rounded-xl font-bold text-sm hover:bg-[#FFD100]/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
