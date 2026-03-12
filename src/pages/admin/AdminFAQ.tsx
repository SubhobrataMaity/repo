import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Plus, Pencil, Trash2, GripVertical, X, Check, ChevronUp, ChevronDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

const EMPTY = { question: '', answer: '', display_order: 0 };

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/faq', { credentials: 'include' });
      const json = await res.json();
      if (json.ok) setFaqs(json.data ?? []);
      else setError(json.error ?? 'Failed to load FAQs');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ question: '', answer: '', display_order: faqs.length });
    setFormError('');
    setShowForm(true);
  }

  function openEdit(f: FAQ) {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, display_order: f.display_order });
    setFormError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.question.trim()) { setFormError('Question is required'); return; }
    if (!form.answer.trim()) { setFormError('Answer is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const url = editing ? `/api/admin/faq/${editing.id}` : '/api/admin/faq';
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
      const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (json.ok) { setDeleteConfirm(null); load(); }
      else setError(json.error ?? 'Delete failed');
    } catch {
      setError('Network error');
    }
  }

  async function reorder(faq: FAQ, direction: 'up' | 'down') {
    const idx = faqs.findIndex(f => f.id === faq.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqs.length) return;
    const swap = faqs[swapIdx];

    await Promise.all([
      fetch(`/api/admin/faq/${faq.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: swap.display_order }),
      }),
      fetch(`/api/admin/faq/${swap.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: faq.display_order }),
      }),
    ]);
    load();
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">FAQ</h1>
            <p className="text-white/40 text-sm mt-1">{faqs.length} questions</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFD100] text-[#0A0A0A] rounded-xl font-bold text-sm hover:bg-[#FFD100]/90 transition-colors"
          >
            <Plus size={18} /> Add FAQ
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p className="text-lg mb-2">No FAQs yet</p>
            <p className="text-sm">Click "Add FAQ" to create your first question</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div
                key={f.id}
                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:border-white/20 transition-colors"
              >
                {/* Order controls */}
                <div className="flex flex-col gap-1 mt-0.5 flex-shrink-0">
                  <button
                    onClick={() => reorder(f, 'up')}
                    disabled={idx === 0}
                    className="w-6 h-6 rounded flex items-center justify-center text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => reorder(f, 'down')}
                    disabled={idx === faqs.length - 1}
                    className="w-6 h-6 rounded flex items-center justify-center text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{f.question}</p>
                  <p className="text-white/40 text-xs mt-1.5 line-clamp-2 leading-relaxed">{f.answer}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(f)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === f.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(f.id)}
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
                      onClick={() => setDeleteConfirm(f.id)}
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
                <h2 className="text-white font-bold">{editing ? 'Edit FAQ' : 'Add FAQ'}</h2>
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
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Question *</label>
                  <input
                    type="text"
                    value={form.question}
                    onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                    placeholder="Enter the question..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFD100] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Answer *</label>
                  <textarea
                    value={form.answer}
                    onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                    placeholder="Enter the answer..."
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFD100] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFD100] transition-colors"
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
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create FAQ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
