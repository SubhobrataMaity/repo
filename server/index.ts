import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createTransport, getAdminEmail } from './mailer';
import adminRoutes from './adminRoutes';
import prisma from './prisma';

const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());

// Mount admin API routes
app.use('/api/admin', adminRoutes);

// Public Data API routes
app.get('/api/public/projects', async (_req, res) => {
  try {
    const data = await prisma.project.findMany({
      include: { project_media: true },
      orderBy: { display_order: 'asc' },
    });
    res.json({ ok: true, data });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const DUMMY_PROJECTS = [
  { id: '1', title: 'Neon Pulse', description: 'A vibrant cyberpunk-inspired UI design system for a next-gen music platform. Deep neon colors, fast-paced motion graphics, and high energy.', slug: 'neon-pulse', folder_name: 'neon-pulse', cover_image: 'https://picsum.photos/seed/neon/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 0, created_at: new Date().toISOString() },
  { id: '2', title: 'Ethereal UI', description: 'A soft, glassmorphic layout created for a wellness and meditation startup. Smooth gradients and subtle frosted details.', slug: 'ethereal-ui', folder_name: 'ethereal-ui', cover_image: 'https://picsum.photos/seed/ui/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 1, created_at: new Date().toISOString() },
  { id: '3', title: 'Bold Identity', description: 'Strong, loud, and confident branding for a streetwear line. Monochromatic themes mixed with heavy brutalist typography.', slug: 'bold-identity', folder_name: 'bold-identity', cover_image: 'https://picsum.photos/seed/brand/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 2, created_at: new Date().toISOString() },
  { id: '4', title: 'Future Flow', description: 'Fluid interaction design demonstrating cutting edge mobile animations and scroll-triggered physics.', slug: 'future-flow', folder_name: 'future-flow', cover_image: 'https://picsum.photos/seed/flow/800/1000', show_in_work_page: true, show_in_selected_work: true, display_order: 3, created_at: new Date().toISOString() },
  { id: '5', title: 'Cyberpunk 2077', description: 'Night City inspired concept interfaces with glaring light artifacts, high tech borders, and gritty details.', slug: 'cyberpunk-2077', folder_name: 'cyberpunk', cover_image: 'https://picsum.photos/seed/cyber/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 4, created_at: new Date().toISOString() },
  { id: '6', title: 'Zenith App', description: 'Productivity application focused on deep work phases featuring dark mode default aesthetics and minimal distractions.', slug: 'zenith-app', folder_name: 'zenith', cover_image: 'https://picsum.photos/seed/zenith/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 5, created_at: new Date().toISOString() },
  { id: '7', title: 'Aura Skincare', description: 'E-commerce platform with elegant natural tones, soft photography, and clean typography.', slug: 'aura-skincare', folder_name: 'aura', cover_image: 'https://picsum.photos/seed/aura/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 6, created_at: new Date().toISOString() },
  { id: '8', title: 'Velocity Motors', description: 'High performance automotive landing pages with aggressive styling and raw speed indicators.', slug: 'velocity-motors', folder_name: 'velocity', cover_image: 'https://picsum.photos/seed/velocity/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 7, created_at: new Date().toISOString() },
  { id: '9', title: 'Echo Audio', description: 'Sleek dark interface for audiophiles. Crisp edges, high end aesthetic, heavily focused on product imagery.', slug: 'echo-audio', folder_name: 'echo', cover_image: 'https://picsum.photos/seed/echo/800/1000', show_in_work_page: true, show_in_selected_work: false, display_order: 8, created_at: new Date().toISOString() },
];

app.get('/api/public/projects/:slug', async (req, res) => {
  try {
    const data = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: { project_media: true },
    });
    if (data) {
      res.json({ ok: true, data });
    } else {
      const dummy = DUMMY_PROJECTS.find(p => p.slug === req.params.slug);
      if (dummy) {
        res.json({ ok: true, data: dummy });
      } else {
        res.status(404).json({ ok: false, error: 'Not found' });
      }
    }
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/public/faq', async (_req, res) => {
  try {
    const data = await prisma.faq.findMany({
      orderBy: { display_order: 'asc' },
    });
    res.json({ ok: true, data });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

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
  // yyyy-mm-dd
  return /^\d{4}-\d{2}-\d{2}$/.test(v.trim());
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/send-enquiry', async (req, res) => {
  const body = req.body ?? {};
  const { name, email, country, countryCode, phoneNumber, message, fields, source } = body;

  const isHeroPayload =
    source === 'hero' &&
    isEmail(email) &&
    typeof fields === 'object' &&
    fields !== null &&
    !Array.isArray(fields);

  const isFullPayload =
    isNonEmptyString(name) &&
    isEmail(email) &&
    isNonEmptyString(country) &&
    isCountryCode(countryCode) &&
    isTenDigitPhone(phoneNumber) &&
    isNonEmptyString(message);

  if (!isHeroPayload && !isFullPayload) {
    return res.status(400).json({ ok: false, error: 'Invalid input' });
  }

  const transport = createTransport();
  const adminEmail = getAdminEmail();

  const now = new Date();
  const submittedAt = now.toISOString();

  const subject = 'Enquiry';
  const text = isFullPayload
    ? [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Country: ${country.trim()}`,
        `Country Code: ${countryCode.trim()}`,
        `Phone Number: ${phoneNumber.trim()}`,
        '',
        'Message:',
        message.trim(),
        '',
        `Date Submitted: ${submittedAt}`,
      ].join('\n')
    : [
        'Source: Hero Section',
        `Email: ${String(email).trim()}`,
        '',
        'Collected Data:',
        ...Object.entries(fields as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v ?? '').trim()}`),
        '',
        `Date Submitted: ${submittedAt}`,
      ].join('\n');

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject,
    text,
  });

  res.json({ ok: true });
});

app.post('/api/send-booking', async (req, res) => {
  const { name, email, country, countryCode, phoneNumber, selectedDate, selectedTime, notes } = req.body ?? {};

  if (
    !isNonEmptyString(name) ||
    !isEmail(email) ||
    !isNonEmptyString(country) ||
    !isCountryCode(countryCode) ||
    !isTenDigitPhone(phoneNumber) ||
    !isIsoDate(selectedDate) ||
    !isNonEmptyString(selectedTime)
  ) {
    return res.status(400).json({ ok: false, error: 'Invalid input' });
  }

  const transport = createTransport();
  const adminEmail = getAdminEmail();

  const subject = 'Booking';
  const text = [
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Country: ${country.trim()}`,
    `Country Code: ${countryCode.trim()}`,
    `Phone Number: ${phoneNumber.trim()}`,
    `Selected Date: ${selectedDate.trim()}`,
    `Selected Time: ${selectedTime.trim()}`,
    `Any Notes: ${isNonEmptyString(notes) ? notes.trim() : ''}`,
  ].join('\n');

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject,
    text,
  });

  res.json({ ok: true });
});

const port = Number(process.env.API_PORT ?? 3001);
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${port}`);
  });
}

export default app;

