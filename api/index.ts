import 'dotenv/config';
import express, { Router, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// ─── Prisma ───────────────────────────────────────────────────────────────────
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ─── Supabase Admin ───────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
if (supabaseUrl === 'https://dummy.supabase.co' || serviceRoleKey === 'dummy_key') {
    console.warn('[SupabaseAdmin] VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.');
}
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Mailer ───────────────────────────────────────────────────────────────────
function requireEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing environment variable: ${name}`);
    return v;
}

function createTransport() {
    return nodemailer.createTransport({
        host: requireEnv('SMTP_HOST'),
        port: Number(requireEnv('SMTP_PORT')),
        secure: Number(requireEnv('SMTP_PORT')) === 465,
        auth: { user: requireEnv('SMTP_USER'), pass: requireEnv('SMTP_PASS') },
    });
}

function getAdminEmail() {
    return requireEnv('ADMIN_EMAIL');
}

// ─── Validation helpers ───────────────────────────────────────────────────────
function isNonEmptyString(v: unknown): v is string {
    return typeof v === 'string' && v.trim().length > 0;
}
function isEmail(v: unknown): v is string {
    if (!isNonEmptyString(v)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function isCountryCode(v: unknown): v is string {
    if (!isNonEmptyString(v)) return false;
    return /^\+?\d{1,4}$/.test(v.trim());
}
function isTenDigitPhone(v: unknown): v is string {
    if (!isNonEmptyString(v)) return false;
    return /^\d{10}$/.test(v.trim());
}
function isIsoDate(v: unknown): v is string {
    if (!isNonEmptyString(v)) return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(v.trim());
}

// ─── Admin Router ─────────────────────────────────────────────────────────────
const SESSION_COOKIE = 'admin_session';
const SESSION_VALUE = 'authenticated';

function requireAuth(req: Request, res: Response, next: () => void) {
    if (req.cookies[SESSION_COOKIE] === SESSION_VALUE) {
        next();
    } else {
        res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

const adminRouter = Router();

adminRouter.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    if (!req.file) return res.status(400).json({ ok: false, error: 'No file uploaded' });
    try {
        const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
        await supabaseAdmin.storage.createBucket('projects', { public: true }).catch(() => { });
        const { error } = await supabaseAdmin.storage
            .from('projects')
            .upload(uniqueFileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
        if (error) return res.status(500).json({ ok: false, error: error.message });
        const { data: publicUrlData } = supabaseAdmin.storage.from('projects').getPublicUrl(uniqueFileName);
        return res.json({ ok: true, url: publicUrlData.publicUrl });
    } catch (error: any) {
        return res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.post('/login', async (req: Request, res: Response): Promise<any> => {
    const { password } = req.body ?? {};
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ ok: false, error: 'Password required' });
    }
    try {
        const admin = await prisma.adminUser.findFirst();
        if (!admin) return res.status(500).json({ ok: false, error: 'Admin user not found' });
        const match = await bcrypt.compare(password, admin.password_hash);
        if (!match) return res.status(401).json({ ok: false, error: 'Invalid password' });
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

adminRouter.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
});

adminRouter.get('/me', requireAuth, (_req: Request, res: Response) => {
    res.json({ ok: true, authenticated: true });
});

adminRouter.get('/dashboard', requireAuth, async (_req: Request, res: Response) => {
    try {
        const [projectsCount, selectedWorkCount, faqsCount, journalsCount, lastProject] = await Promise.all([
            prisma.project.count(),
            prisma.project.count({ where: { show_in_selected_work: true } }),
            prisma.faq.count(),
            prisma.journal.count(),
            prisma.project.findFirst({ orderBy: { created_at: 'desc' } }),
        ]);
        res.json({
            ok: true,
            stats: {
                totalProjects: projectsCount,
                selectedWorkCount,
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

adminRouter.get('/projects', requireAuth, async (_req: Request, res: Response) => {
    try {
        const data = await prisma.project.findMany({ include: { project_media: true }, orderBy: { display_order: 'asc' } });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.get('/projects/:id', requireAuth, async (req: Request, res: Response): Promise<any> => {
    try {
        const data = await prisma.project.findUnique({ where: { id: req.params.id }, include: { project_media: true } });
        if (!data) return res.status(404).json({ ok: false, error: 'Project not found' });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.post('/projects', requireAuth, async (req: Request, res: Response): Promise<any> => {
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
            },
        });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.put('/projects/:id', requireAuth, async (req: Request, res: Response) => {
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
        const data = await prisma.project.update({ where: { id: req.params.id }, data: updates });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.delete('/projects/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.post('/projects/:id/media', requireAuth, async (req: Request, res: Response): Promise<any> => {
    const { media_url, media_type, order_index } = req.body ?? {};
    if (!media_url) return res.status(400).json({ ok: false, error: 'media_url is required' });
    try {
        const data = await prisma.projectMedia.create({
            data: { project_id: req.params.id, media_url: media_url.trim(), media_type: media_type?.trim() ?? 'image', order_index: Number(order_index) || 0 },
        });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.delete('/projects/:projectId/media/:mediaId', requireAuth, async (req: Request, res: Response) => {
    try {
        const media = await prisma.projectMedia.findUnique({ where: { id: req.params.mediaId } });
        if (media) {
            const fileName = media.media_url.split('/').pop();
            if (fileName) await supabaseAdmin.storage.from('projects').remove([fileName]);
        }
        await prisma.projectMedia.deleteMany({ where: { id: req.params.mediaId, project_id: req.params.projectId } });
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.post('/projects/:id/reorder-media', requireAuth, async (req: Request, res: Response): Promise<any> => {
    const { mediaIds } = req.body ?? {};
    if (!Array.isArray(mediaIds)) return res.status(400).json({ ok: false, error: 'mediaIds is required' });
    try {
        const transaction = mediaIds.map((id, index) => prisma.projectMedia.update({ where: { id }, data: { order_index: index } }));
        await prisma.$transaction(transaction);
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.get('/faq', requireAuth, async (_req: Request, res: Response) => {
    try {
        const data = await prisma.faq.findMany({ orderBy: { display_order: 'asc' } });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.post('/faq', requireAuth, async (req: Request, res: Response): Promise<any> => {
    const { question, answer, display_order } = req.body ?? {};
    if (!question || !answer) return res.status(400).json({ ok: false, error: 'Question and answer are required' });
    try {
        const data = await prisma.faq.create({ data: { question: question.trim(), answer: answer.trim(), display_order: Number(display_order) || 0 } });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.put('/faq/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const body = req.body ?? {};
        const updates: Record<string, any> = {};
        if (body.question !== undefined) updates.question = body.question.trim();
        if (body.answer !== undefined) updates.answer = body.answer.trim();
        if (body.display_order !== undefined) updates.display_order = Number(body.display_order);
        const data = await prisma.faq.update({ where: { id: req.params.id }, data: updates });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.delete('/faq/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        await prisma.faq.delete({ where: { id: req.params.id } });
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.get('/journals', requireAuth, async (_req: Request, res: Response) => {
    try {
        const data = await prisma.journal.findMany({ orderBy: { created_at: 'desc' } });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.post('/journals', requireAuth, async (req: Request, res: Response): Promise<any> => {
    const { title, content } = req.body ?? {};
    if (!title) return res.status(400).json({ ok: false, error: 'Title is required' });
    try {
        const data = await prisma.journal.create({ data: { title: title.trim(), content: content?.trim() ?? '' } });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.put('/journals/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const body = req.body ?? {};
        const updates: Record<string, any> = {};
        if (body.title !== undefined) updates.title = body.title.trim();
        if (body.content !== undefined) updates.content = body.content.trim();
        const data = await prisma.journal.update({ where: { id: req.params.id }, data: updates });
        res.json({ ok: true, data });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

adminRouter.delete('/journals/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        await prisma.journal.delete({ where: { id: req.params.id } });
        res.json({ ok: true });
    } catch (error: any) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// ─── Main App ─────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());

app.use('/api/admin', adminRouter);

const DUMMY_PROJECTS = [
    { id: '1', title: 'Neon Pulse', description: 'A vibrant cyberpunk-inspired UI design system for a next-gen music platform.', slug: 'neon-pulse', folder_name: 'neon-pulse', cover_image: 'https://picsum.photos/seed/neon/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 0, created_at: new Date().toISOString() },
    { id: '2', title: 'Ethereal UI', description: 'A soft, glassmorphic layout created for a wellness and meditation startup.', slug: 'ethereal-ui', folder_name: 'ethereal-ui', cover_image: 'https://picsum.photos/seed/ui/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 1, created_at: new Date().toISOString() },
    { id: '3', title: 'Bold Identity', description: 'Strong, loud, and confident branding for a streetwear line.', slug: 'bold-identity', folder_name: 'bold-identity', cover_image: 'https://picsum.photos/seed/brand/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 2, created_at: new Date().toISOString() },
    { id: '4', title: 'Future Flow', description: 'Fluid interaction design demonstrating cutting edge mobile animations.', slug: 'future-flow', folder_name: 'future-flow', cover_image: 'https://picsum.photos/seed/flow/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 3, created_at: new Date().toISOString() },
    { id: '5', title: 'Cyberpunk 2077', description: 'Night City inspired concept interfaces.', slug: 'cyberpunk-2077', folder_name: 'cyberpunk', cover_image: 'https://picsum.photos/seed/cyber/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 4, created_at: new Date().toISOString() },
    { id: '6', title: 'Zenith App', description: 'Productivity application focused on deep work phases.', slug: 'zenith-app', folder_name: 'zenith', cover_image: 'https://picsum.photos/seed/zenith/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 5, created_at: new Date().toISOString() },
    { id: '7', title: 'Aura Skincare', description: 'E-commerce platform with elegant natural tones.', slug: 'aura-skincare', folder_name: 'aura', cover_image: 'https://picsum.photos/seed/aura/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 6, created_at: new Date().toISOString() },
    { id: '8', title: 'Velocity Motors', description: 'High performance automotive landing pages.', slug: 'velocity-motors', folder_name: 'velocity', cover_image: 'https://picsum.photos/seed/velocity/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 7, created_at: new Date().toISOString() },
    { id: '9', title: 'Echo Audio', description: 'Sleek dark interface for audiophiles.', slug: 'echo-audio', folder_name: 'echo', cover_image: 'https://picsum.photos/seed/echo/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 8, created_at: new Date().toISOString() },
];

app.get('/api/public/projects', async (req, res) => {
    try {
        const data = await prisma.project.findMany({ include: { project_media: true }, orderBy: { display_order: 'asc' } });
        res.json({ ok: true, data });
    } catch (err: any) {
        console.error('Prisma error in /projects:', err.message);
        res.json({ ok: true, data: [] });
    }
});

app.get('/api/public/projects/:slug', async (req, res) => {
    try {
        const data = await prisma.project.findUnique({ where: { slug: req.params.slug }, include: { project_media: true } });
        if (data) return res.json({ ok: true, data });
    } catch (err: any) {
        console.error('Prisma error in /projects/:slug:', err.message);
    }
    const dummy = DUMMY_PROJECTS.find(p => p.slug === req.params.slug);
    if (dummy) res.json({ ok: true, data: dummy });
    else res.status(404).json({ ok: false, error: 'Not found' });
});

app.get('/api/public/faq', async (req, res) => {
    try {
        const data = await prisma.faq.findMany({ orderBy: { display_order: 'asc' } });
        res.json({ ok: true, data });
    } catch (err: any) {
        console.error('Prisma error in /faq:', err.message);
        res.json({ ok: true, data: [] });
    }
});

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

app.post('/api/send-enquiry', async (req, res) => {
    const body = req.body ?? {};
    const { name, email, country, countryCode, phoneNumber, message, fields, source } = body;

    const isHeroPayload = source === 'hero' && isEmail(email) && typeof fields === 'object' && fields !== null && !Array.isArray(fields);
    const isFullPayload = isNonEmptyString(name) && isEmail(email) && isNonEmptyString(country) && isCountryCode(countryCode) && isTenDigitPhone(phoneNumber) && isNonEmptyString(message);

    if (!isHeroPayload && !isFullPayload) return res.status(400).json({ ok: false, error: 'Invalid input' });

    const transport = createTransport();
    const adminEmail = getAdminEmail();
    const submittedAt = new Date().toISOString();

    const text = isFullPayload
        ? [`Name: ${name.trim()}`, `Email: ${email.trim()}`, `Country: ${country.trim()}`, `Country Code: ${countryCode.trim()}`, `Phone Number: ${phoneNumber.trim()}`, '', 'Message:', message.trim(), '', `Date Submitted: ${submittedAt}`].join('\n')
        : ['Source: Hero Section', `Email: ${String(email).trim()}`, '', 'Collected Data:', ...Object.entries(fields as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v ?? '').trim()}`), '', `Date Submitted: ${submittedAt}`].join('\n');

    await transport.sendMail({ from: process.env.SMTP_USER, to: adminEmail, subject: 'Enquiry', text });
    res.json({ ok: true });
});

app.post('/api/send-booking', async (req, res) => {
    const { name, email, country, countryCode, phoneNumber, selectedDate, selectedTime, notes } = req.body ?? {};

    if (!isNonEmptyString(name) || !isEmail(email) || !isNonEmptyString(country) || !isCountryCode(countryCode) || !isTenDigitPhone(phoneNumber) || !isIsoDate(selectedDate) || !isNonEmptyString(selectedTime)) {
        return res.status(400).json({ ok: false, error: 'Invalid input' });
    }

    const transport = createTransport();
    const adminEmail = getAdminEmail();
    const text = [`Name: ${name.trim()}`, `Email: ${email.trim()}`, `Country: ${country.trim()}`, `Country Code: ${countryCode.trim()}`, `Phone Number: ${phoneNumber.trim()}`, `Selected Date: ${selectedDate.trim()}`, `Selected Time: ${selectedTime.trim()}`, `Any Notes: ${isNonEmptyString(notes) ? notes.trim() : ''}`].join('\n');

    await transport.sendMail({ from: process.env.SMTP_USER, to: adminEmail, subject: 'Booking', text });
    res.json({ ok: true });
});

const port = Number(process.env.API_PORT ?? 3001);
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`API server listening on http://localhost:${port}`);
    });
}

export default app;