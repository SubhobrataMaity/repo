import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import multer from 'multer';
import { supabaseAdmin } from './supabaseAdmin';

// Use memory storage to process uploads directly to Supabase via buffers.
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// ─── Session Cookie Name ──────────────────────────────────────────────────────
const SESSION_COOKIE = 'admin_session';
const SESSION_VALUE = 'authenticated';

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: () => void) {
  if (req.cookies[SESSION_COOKIE] === SESSION_VALUE) {
    next();
  } else {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
}

// ─── POST /api/admin/login ────────────────────────────────────────────────────
// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No file uploaded' });
  }

  try {
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;

    // Ensure bucket exists or ignore if it already does
    await supabaseAdmin.storage.createBucket('projects', { public: true }).catch(() => { });

    const { data, error } = await supabaseAdmin.storage
      .from('projects')
      .upload(uniqueFileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('projects')
      .getPublicUrl(uniqueFileName);

    return res.json({ ok: true, url: publicUrlData.publicUrl });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<any> => {
  const { password } = req.body ?? {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ ok: false, error: 'Password required' });
  }

  try {
    const admin = await prisma.adminUser.findFirst();
    if (!admin) {
      return res.status(500).json({ ok: false, error: 'Admin user not found' });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ ok: false, error: 'Invalid password' });
    }

    res.cookie(SESSION_COOKIE, SESSION_VALUE, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });

    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
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
  try {
    const [projectsCount, selectedWorkCount, faqsCount, journalsCount, lastProject] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { show_in_selected_work: true } }),
      prisma.faq.count(),
      prisma.journal.count(),
      prisma.project.findFirst({ orderBy: { created_at: 'desc' } })
    ]);

    res.json({
      ok: true,
      stats: {
        totalProjects: projectsCount,
        selectedWorkCount: selectedWorkCount,
        totalFAQs: faqsCount,
        totalJournals: journalsCount,
        lastProjectTitle: lastProject?.title ?? null,
        lastProjectDate: lastProject?.created_at ?? null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  PROJECTS
// ═════════════════════════════════════════════════════════════════════════════

router.get('/projects', requireAuth, async (_req: Request, res: Response) => {
  try {
    const data = await prisma.project.findMany({
      include: { project_media: true },
      orderBy: { display_order: 'asc' },
    });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get('/projects/:id', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const data = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { project_media: true },
    });
    if (!data) return res.status(404).json({ ok: false, error: 'Project not found' });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/projects', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const { title, description, slug, folder_name, cover_image, show_in_work_page, show_in_selected_work, display_order } = req.body ?? {};
  if (!title || !slug) return res.status(400).json({ ok: false, error: 'Title and slug are required' });

  try {
    const data = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() ?? '',
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        folder_name: folder_name?.trim() ?? slug.trim(),
        cover_image: cover_image?.trim() ?? '',
        show_in_work_page: Boolean(show_in_work_page),
        show_in_selected_work: Boolean(show_in_selected_work),
        display_order: Number(display_order) || 0,
      }
    });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.put('/projects/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const updates: Record<string, any> = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.slug !== undefined) updates.slug = body.slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (body.folder_name !== undefined) updates.folder_name = body.folder_name.trim();
    if (body.cover_image !== undefined) updates.cover_image = body.cover_image.trim();
    if (body.show_in_work_page !== undefined) updates.show_in_work_page = Boolean(body.show_in_work_page);
    if (body.show_in_selected_work !== undefined) updates.show_in_selected_work = Boolean(body.show_in_selected_work);
    if (body.display_order !== undefined) updates.display_order = Number(body.display_order);

    const data = await prisma.project.update({
      where: { id: req.params.id },
      data: updates,
    });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.delete('/projects/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ─── Project Media ───────────────────────────────────────────────────────────

router.post('/projects/:id/media', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const { media_url, media_type, order_index } = req.body ?? {};
  if (!media_url) return res.status(400).json({ ok: false, error: 'media_url is required' });

  try {
    const data = await prisma.projectMedia.create({
      data: {
        project_id: req.params.id,
        media_url: media_url.trim(),
        media_type: media_type?.trim() ?? 'image',
        order_index: Number(order_index) || 0,
      }
    });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.delete('/projects/:projectId/media/:mediaId', requireAuth, async (req: Request, res: Response) => {
  try {
    const media = await prisma.projectMedia.findUnique({ where: { id: req.params.mediaId } });
    if (media) {
      const fileName = media.media_url.split('/').pop();
      if (fileName) {
        await supabaseAdmin.storage.from('projects').remove([fileName]);
      }
    }
    await prisma.projectMedia.deleteMany({
      where: { id: req.params.mediaId, project_id: req.params.projectId }
    });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/projects/:id/reorder-media', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const { mediaIds } = req.body ?? {};
  if (!Array.isArray(mediaIds)) return res.status(400).json({ ok: false, error: 'mediaIds is required' });

  try {
    const transaction = mediaIds.map((id, index) =>
      prisma.projectMedia.update({ where: { id }, data: { order_index: index } })
    );
    await prisma.$transaction(transaction);
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  FAQ
// ═════════════════════════════════════════════════════════════════════════════

router.get('/faq', requireAuth, async (_req: Request, res: Response) => {
  try {
    const data = await prisma.faq.findMany({ orderBy: { display_order: 'asc' } });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/faq', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const { question, answer, display_order } = req.body ?? {};
  if (!question || !answer) return res.status(400).json({ ok: false, error: 'Question and answer are required' });

  try {
    const data = await prisma.faq.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        display_order: Number(display_order) || 0,
      }
    });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.put('/faq/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const updates: Record<string, any> = {};
    if (body.question !== undefined) updates.question = body.question.trim();
    if (body.answer !== undefined) updates.answer = body.answer.trim();
    if (body.display_order !== undefined) updates.display_order = Number(body.display_order);

    const data = await prisma.faq.update({
      where: { id: req.params.id },
      data: updates,
    });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.delete('/faq/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.faq.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  JOURNALS
// ═════════════════════════════════════════════════════════════════════════════

router.get('/journals', requireAuth, async (_req: Request, res: Response) => {
  try {
    const data = await prisma.journal.findMany({ orderBy: { created_at: 'desc' } });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/journals', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const { title, content } = req.body ?? {};
  if (!title) return res.status(400).json({ ok: false, error: 'Title is required' });

  try {
    const data = await prisma.journal.create({
      data: { title: title.trim(), content: content?.trim() ?? '' }
    });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.put('/journals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const updates: Record<string, any> = {};
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.content !== undefined) updates.content = body.content.trim();

    const data = await prisma.journal.update({
      where: { id: req.params.id },
      data: updates,
    });
    res.json({ ok: true, data });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.delete('/journals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.journal.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
