import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createTransport, getAdminEmail } from './mailer';
import adminRoutes from './adminRoutes';

const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());

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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// ─── Admin API ────────────────────────────────────────────────────────────────
app.use('/api/admin', adminRoutes);

// ─── Contact / Booking Emails ─────────────────────────────────────────────────
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
        ...Object.entries(fields as Record<string, unknown>).map(
          ([k, v]) => `${k}: ${String(v ?? '').trim()}`
        ),
        '',
        `Date Submitted: ${submittedAt}`,
      ].join('\n');

  try {
    await transport.sendMail({ from: process.env.SMTP_USER, to: adminEmail, subject, text });
    console.log('Enquiry email sent successfully to', adminEmail);
  } catch (error) {
    console.error('Failed to send enquiry email:', error);
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }

  res.json({ ok: true });
});

app.post('/api/send-booking', async (req, res) => {
  const { name, email, country, countryCode, phoneNumber, selectedDate, selectedTime, notes } =
    req.body ?? {};

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

  try {
    await transport.sendMail({ from: process.env.SMTP_USER, to: adminEmail, subject, text });
    console.log('Booking email sent successfully to', adminEmail);
  } catch (error) {
    console.error('Failed to send booking email:', error);
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }

  res.json({ ok: true });
});

const port = Number(process.env.API_PORT ?? 3001);
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
