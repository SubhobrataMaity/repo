import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, X, Check } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  folder_name: string;
  cover_image: string;
  show_in_work_page: boolean;
  show_in_selected_work: boolean;
  display_order: number;
  created_at: string;
}

const EMPTY: Omit<Project, 'id' | 'created_at'> = {
  title: '',
  description: '',
  slug: '',
  folder_name: '',
  cover_image: '',
  show_in_work_page: true,
  show_in_selected_work: false,
  display_order: 0,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects', { credentials: 'include' });
      const json = await res.json();
      if (json.ok) setProjects(json.data ?? []);
      else setError(json.error ?? 'Failed to load projects');
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

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      slug: p.slug,
      folder_name: p.folder_name,
      cover_image: p.cover_image,
      show_in_work_page: p.show_in_work_page,
      show_in_selected_work: p.show_in_selected_work,
      display_order: p.display_order,
    });
    setFormError('');
    setShowForm(true);
  }

  function handleField<K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) {
    setForm(f => {
      const next = { ...f, [k]: v };
      // Auto-generate slug from title if creating new
      if (k === 'title' && !editing) {
        next.slug = slugify(v as string);
        next.folder_name = slugify(v as string);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    if (!form.slug.trim()) { setFormError('Slug is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const url = editing ? `/api/admin/projects/${editing.id}` : '/api/admin/projects';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.ok) {
        setShowForm(false);
        load();
      } else {
        setFormError(json.error ?? 'Save failed');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const json = await res.json();
      if (json.ok) { setDeleteConfirm(null); load(); }
      else setError(json.error ?? 'Delete failed');
    } catch {
      setError('Network error');
    }
  }

  async function toggleField(p: Project, field: 'show_in_work_page' | 'show_in_selected_work') {
    await fetch(`/api/admin/projects/${p.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !p[field] }),
    });
    load();
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-white/40 text-sm mt-1">{projects.length} total projects</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFD100] text-[#0A0A0A] rounded-xl font-bold text-sm hover:bg-[#FFD100]/90 transition-colors"
          >
            <Plus size={18} /> Add Project
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {/* Project List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">Click "Add Project" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:border-white/20 transition-colors"
              >
                <GripVertical size={16} className="text-white/20 flex-shrink-0" />

                {/* Cover thumb */}
                <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No img</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{p.title}</p>
                  <p className="text-white/30 text-xs mt-0.5">/{p.slug} · Order: {p.display_order}</p>
                </div>

                {/* Toggles */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => toggleField(p, 'show_in_work_page')}
                    title="Work Page visibility"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      p.show_in_work_page ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {p.show_in_work_page ? <Eye size={12} /> : <EyeOff size={12} />}
                    Work
                  </button>
                  <button
                    onClick={() => toggleField(p, 'show_in_selected_work')}
                    title="Selected Work visibility"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      p.show_in_selected_work ? 'bg-[#FFD100]/20 text-[#FFD100]' : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {p.show_in_selected_work ? <Eye size={12} /> : <EyeOff size={12} />}
                    Featured
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === p.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
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

        {/* ── Modal Form ── */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#161616] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-white font-bold">{editing ? 'Edit Project' : 'Add Project'}</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>
                )}

                {[
                  { label: 'Title *', key: 'title', type: 'text', placeholder: 'Project title' },
                  { label: 'Slug *', key: 'slug', type: 'text', placeholder: 'project-slug' },
                  { label: 'Folder Name', key: 'folder_name', type: 'text', placeholder: 'project-folder' },
                  { label: 'Cover Image URL', key: 'cover_image', type: 'text', placeholder: 'https://...' },
                  { label: 'Display Order', key: 'display_order', type: 'number', placeholder: '0' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      value={String(form[f.key as keyof typeof EMPTY])}
                      onChange={e => handleField(f.key as keyof typeof EMPTY, (f.type === 'number' ? Number(e.target.value) : e.target.value) as never)}
                      placeholder={f.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFD100] transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => handleField('description', e.target.value)}
                    placeholder="Project description..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFD100] transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  {[
                    { label: 'Show in Work Page', key: 'show_in_work_page' },
                    { label: 'Show in Selected Work', key: 'show_in_selected_work' },
                  ].map(f => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.key as keyof typeof EMPTY])}
                        onChange={e => handleField(f.key as keyof typeof EMPTY, e.target.checked as never)}
                        className="w-4 h-4 accent-[#FFD100]"
                      />
                      <span className="text-white/60 text-sm">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal footer */}
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
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
