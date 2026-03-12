import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabaseAdmin';

const router = Router();

// ─── Session Cookie Name ──────────────────────────────────────────────────────
const SESSION_COOKIE = 'admin_session';
const SESSION_VALUE  = 'authenticated';  // simple token; swap for JWT in prod

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: () => void) {
  // Authentication disabled per request
  next();
}

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { password } = req.body ?? {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ ok: false, error: 'Password required' });
  }

  // Fetch the single admin user record
  const { data: users, error } = await supabaseAdmin
    .from('admin_users')
    .select('password_hash')
    .limit(1);

  if (error || !users || users.length === 0) {
    return res.status(500).json({ ok: false, error: 'Admin user not found' });
  }

  const match = await bcrypt.compare(password, users[0].password_hash);
  if (!match) {
    return res.status(401).json({ ok: false, error: 'Invalid password' });
  }

  // Set secure HTTP-only cookie
  res.cookie(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
  });

  return res.json({ ok: true });
});

// ─── POST /api/admin/logout ───────────────────────────────────────────────────
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

// ─── GET /api/admin/me ────────────────────────────────────────────────────────
router.get('/me', requireAuth, (_req: Request, res: Response) => {
  res.json({ ok: true, authenticated: true });
});

// ═════════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

router.get('/dashboard', requireAuth, async (_req: Request, res: Response) => {
  const [projects, selectedWork, faqs, journals] = await Promise.all([
    supabaseAdmin.from('projects').select('id, title, created_at').order('created_at', { ascending: false }),
    supabaseAdmin.from('projects').select('id').eq('show_in_selected_work', true),
    supabaseAdmin.from('faq').select('id, updated_at').order('display_order'),
    supabaseAdmin.from('journals').select('id'),
  ]);

  const lastProject = projects.data?.[0] ?? null;

  res.json({
    ok: true,
    stats: {
      totalProjects: projects.data?.length ?? 0,
      selectedWorkCount: selectedWork.data?.length ?? 0,
      totalFAQs: faqs.data?.length ?? 0,
      totalJournals: journals.data?.length ?? 0,
      lastProjectTitle: lastProject?.title ?? null,
      lastProjectDate: lastProject?.created_at ?? null,
    },
  });
});

// ═════════════════════════════════════════════════════════════════════════════
//  PROJECTS
// ═════════════════════════════════════════════════════════════════════════════

// GET all projects
router.get('/projects', requireAuth, async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*, project_images(*)')
    .order('display_order', { ascending: true });

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// GET single project
router.get('/projects/:id', requireAuth, async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*, project_images(*)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ ok: false, error: 'Project not found' });
  res.json({ ok: true, data });
});

// POST create project
router.post('/projects', requireAuth, async (req: Request, res: Response) => {
  const {
    title, description, slug, folder_name, cover_image,
    show_in_work_page, show_in_selected_work, display_order,
  } = req.body ?? {};

  if (!title || !slug) {
    return res.status(400).json({ ok: false, error: 'Title and slug are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({
      title: title.trim(),
      description: description?.trim() ?? '',
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      folder_name: folder_name?.trim() ?? slug.trim(),
      cover_image: cover_image?.trim() ?? '',
      show_in_work_page: Boolean(show_in_work_page),
      show_in_selected_work: Boolean(show_in_selected_work),
      display_order: Number(display_order) || 0,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// PUT update project
router.put('/projects/:id', requireAuth, async (req: Request, res: Response) => {
  const {
    title, description, slug, folder_name, cover_image,
    show_in_work_page, show_in_selected_work, display_order,
  } = req.body ?? {};

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (slug !== undefined) updates.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
  if (folder_name !== undefined) updates.folder_name = folder_name.trim();
  if (cover_image !== undefined) updates.cover_image = cover_image.trim();
  if (show_in_work_page !== undefined) updates.show_in_work_page = Boolean(show_in_work_page);
  if (show_in_selected_work !== undefined) updates.show_in_selected_work = Boolean(show_in_selected_work);
  if (display_order !== undefined) updates.display_order = Number(display_order);

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// DELETE project (also deletes its images via cascade)
router.delete('/projects/:id', requireAuth, async (req: Request, res: Response) => {
  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true });
});

// ─── Project Images ───────────────────────────────────────────────────────────

// POST add image to project
router.post('/projects/:id/images', requireAuth, async (req: Request, res: Response) => {
  const { image_path, image_order } = req.body ?? {};
  if (!image_path) {
    return res.status(400).json({ ok: false, error: 'image_path is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('project_images')
    .insert({
      project_id: req.params.id,
      image_path: image_path.trim(),
      image_order: Number(image_order) || 0,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// DELETE project image
router.delete('/projects/:projectId/images/:imageId', requireAuth, async (req: Request, res: Response) => {
  const { error } = await supabaseAdmin
    .from('project_images')
    .delete()
    .eq('id', req.params.imageId)
    .eq('project_id', req.params.projectId);

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true });
});

// ═════════════════════════════════════════════════════════════════════════════
//  FAQ
// ═════════════════════════════════════════════════════════════════════════════

// GET all FAQs
router.get('/faq', requireAuth, async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('faq')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// POST create FAQ
router.post('/faq', requireAuth, async (req: Request, res: Response) => {
  const { question, answer, display_order } = req.body ?? {};
  if (!question || !answer) {
    return res.status(400).json({ ok: false, error: 'Question and answer are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('faq')
    .insert({
      question: question.trim(),
      answer: answer.trim(),
      display_order: Number(display_order) || 0,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// PUT update FAQ
router.put('/faq/:id', requireAuth, async (req: Request, res: Response) => {
  const { question, answer, display_order } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (question !== undefined) updates.question = question.trim();
  if (answer !== undefined) updates.answer = answer.trim();
  if (display_order !== undefined) updates.display_order = Number(display_order);

  const { data, error } = await supabaseAdmin
    .from('faq')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// DELETE FAQ
router.delete('/faq/:id', requireAuth, async (req: Request, res: Response) => {
  const { error } = await supabaseAdmin
    .from('faq')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true });
});

// ═════════════════════════════════════════════════════════════════════════════
//  JOURNALS
// ═════════════════════════════════════════════════════════════════════════════

// GET all journals
router.get('/journals', requireAuth, async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('journals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// POST create journal
router.post('/journals', requireAuth, async (req: Request, res: Response) => {
  const { title, content } = req.body ?? {};
  if (!title) {
    return res.status(400).json({ ok: false, error: 'Title is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('journals')
    .insert({ title: title.trim(), content: content?.trim() ?? '' })
    .select()
    .single();

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// PUT update journal
router.put('/journals/:id', requireAuth, async (req: Request, res: Response) => {
  const { title, content } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title.trim();
  if (content !== undefined) updates.content = content.trim();

  const { data, error } = await supabaseAdmin
    .from('journals')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, data });
});

// DELETE journal
router.delete('/journals/:id', requireAuth, async (req: Request, res: Response) => {
  const { error } = await supabaseAdmin
    .from('journals')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true });
});

export default router;
