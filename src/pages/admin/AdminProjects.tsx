import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, X, Check, UploadCloud } from 'lucide-react';

interface ProjectMedia {
  id: string;
  project_id: string;
  media_url: string;
  media_type: string;
  order_index: number;
}

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
  project_media?: ProjectMedia[];
}

const EMPTY: Omit<Project, 'id' | 'created_at' | 'project_images'> = {
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

function SortableMediaItem({ media, handleDeleteMedia }: { media: ProjectMedia, handleDeleteMedia: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: media.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group w-full aspect-square bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <img src={media.media_url} alt="Project media" className="w-full h-full object-cover" />
      <button
        onClick={() => handleDeleteMedia(media.id)}
        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white">
          <Trash2 size={14} />
        </div>
      </button>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [projectMedia, setProjectMedia] = useState<ProjectMedia[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setProjectMedia((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
    setProjectMedia([]);
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
    setProjectMedia(p.project_media || []);
    setFormError('');
    setShowForm(true);
  }

  function handleField<K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'title' && !editing) {
        next.slug = slugify(v as string);
        next.folder_name = slugify(v as string);
      }
      return next;
    });
  }

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    const json = await res.json();
    if (json.ok) return json.url;
    throw new Error(json.error || 'Upload failed');
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    setFormError('');
    try {
      const url = await uploadFile(e.target.files[0]);
      handleField('cover_image', url);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setUploadingImage(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAddMedia(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing || !e.target.files?.length) return;
    setUploadingImage(true);
    setFormError('');
    try {
      const file = e.target.files[0];
      const url = await uploadFile(file);
      const media_type = file.type.split('/')[0];
      
      const res = await fetch(`/api/admin/projects/${editing.id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_url: url, media_type, order_index: projectMedia.length }),
        credentials: 'include',
      });
      const json = await res.json();
      if (json.ok) {
        setProjectMedia(prev => [...prev, json.data]);
        load();
      } else {
        setFormError(json.error || 'Failed to add media');
      }
    } catch(err: any){
      setFormError(err.message);
    } finally {
      setUploadingImage(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  }

  async function handleDeleteMedia(mediaId: string) {
    if (!editing) return;
    try {
      const res = await fetch(`/api/admin/projects/${editing.id}/media/${mediaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setProjectMedia(prev => prev.filter(media => media.id !== mediaId));
        load();
      }
    } catch(err: any) {
      setFormError('Failed to delete media');
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    if (!form.slug.trim()) { setFormError('Slug is required'); return; }
    
    if (form.show_in_selected_work && (!editing || !editing.show_in_selected_work)) {
      const selectedCount = projects.filter(proj => proj.show_in_selected_work && proj.id !== editing?.id).length;
      if (selectedCount >= 4) {
        setFormError('Maximum 4 projects can be featured in Selected Works.');
        return;
      }
    }

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
        if (editing) {
          const mediaIds = projectMedia.map(m => m.id);
          await fetch(`/api/admin/projects/${editing.id}/reorder-media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaIds }),
            credentials: 'include',
          });
        }
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
    if (field === 'show_in_selected_work' && !p.show_in_selected_work) {
      const selectedCount = projects.filter(proj => proj.show_in_selected_work).length;
      if (selectedCount >= 4) {
        setError('Maximum 4 projects can be featured in Selected Works.');
        setTimeout(() => setError(''), 3000);
        return;
      }
    }

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
                  <p className="text-white/30 text-xs mt-0.5">/{p.slug} · Order: {p.display_order} · Media: {p.project_media?.length||0}</p>
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
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-widest mb-1.5">Cover Image (URL or Upload)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.cover_image}
                      onChange={e => handleField('cover_image', e.target.value)}
                      placeholder="https://... or click upload"
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#FFD100] transition-colors"
                    />
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <UploadCloud size={16} /> Upload
                    </button>
                  </div>
                  {form.cover_image && (
                     <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-white/10">
                        <img src={form.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                     </div>
                  )}
                </div>

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

                {/* Multiple Images Upload (Only when editing an existing project) */}
                {editing && (
                  <div className="pt-4 mt-6 border-t border-white/10">
                     <div className="flex items-center justify-between mb-3">
                        <label className="block text-white/50 text-xs font-bold uppercase tracking-widest">Project Media ({projectMedia.length})</label>
                        <input type="file" ref={galleryInputRef} className="hidden" accept="image/*,video/*" onChange={handleAddMedia} />
                        <button 
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#FFD100]/20 text-[#FFD100] hover:bg-[#FFD100]/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <UploadCloud size={14} /> Add Media
                        </button>
                     </div>
                     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                       <SortableContext items={projectMedia} strategy={verticalListSortingStrategy}>
                         <div className="grid grid-cols-3 gap-3">
                            {projectMedia.map((media) => (
                              <SortableMediaItem key={media.id} media={media} handleDeleteMedia={handleDeleteMedia} />
                            ))}
                         </div>
                       </SortableContext>
                     </DndContext>
                     {!projectMedia.length && (
                       <div className="text-center py-4 bg-white/5 rounded-xl border border-white/10 text-white/30 text-xs">
                         No project media added yet.
                       </div>
                     )}
                  </div>
                )}
                {!editing && (
                   <div className="pt-4 mt-6 border-t border-white/10 text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10 text-white/30 text-xs">
                     Save this project first to manage its project media.
                   </div>
                )}
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
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 bg-[#FFD100] text-[#0A0A0A] rounded-xl font-bold text-sm hover:bg-[#FFD100]/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : uploadingImage ? 'Uploading…' : editing ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
