import type { VercelRequest, VercelResponse } from '@vercel/node';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 6;

function clientKey(req: VercelRequest) {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return String(first || req.headers['x-real-ip'] || 'unknown').trim().slice(0, 100);
}

function allow(req: VercelRequest) {
  const key = clientKey(req);
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= LIMIT) return false;
  current.count += 1;
  return true;
}

function clean(value: unknown, max: number) {
  return String(value ?? '').trim().slice(0, max);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default async function supportContact(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });
  if (!allow(req)) return res.status(429).json({ error: 'Too many messages. Please wait a few minutes and try again.' });

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const inbox = process.env.SUPPORT_INBOX?.trim();
  if (!apiKey || !inbox) return res.status(503).json({ error: 'Support messaging is temporarily unavailable.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (clean(body?.website, 200)) return res.status(200).json({ sent: true });

    const name = clean(body?.name, 100);
    const email = clean(body?.email, 254).toLowerCase();
    const inquiry = clean(body?.inquiry, 100);
    const message = clean(body?.message, 4000);

    if (!name || !inquiry || message.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid name, email and message.' });
    }

    const from = process.env.RESEND_SUPPORT_FROM?.trim() || 'yuzimiONLINE Support <support@yuzimi.online>';
    const subject = `YUZIMI support: ${inquiry}`;
    const html = `<h2>${escapeHtml(inquiry)}</h2>
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [inbox],
        reply_to: email,
        subject,
        text: `${inquiry}\n\nFrom: ${name} <${email}>\n\n${message}`,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const result = await response.json().catch(() => ({})) as { id?: string };
    if (!response.ok || !result.id) {
      console.error('Support contact send failed:', response.status);
      return res.status(502).json({ error: 'Could not send your message. Please try again.' });
    }

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error('Support contact error:', error);
    return res.status(500).json({ error: 'Could not send your message. Please try again.' });
  }
}
