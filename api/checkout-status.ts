import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureOrdersTable, markPaid, ordersDb } from '../lib/checkout/orders.js';

export default async function status(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const id = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!/^cs_test_[a-zA-Z0-9_]+$/.test(id) || id.length > 255) return res.status(400).json({ error: 'Invalid test checkout session.' });
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) return res.status(503).json({ error: 'Stripe test checkout is not configured.' });
  try {
    await ensureOrdersTable();
    const sql = ordersDb();
    const rows = await sql`SELECT id, status FROM checkout_orders WHERE stripe_session_id = ${id}`;
    if (!rows.length) return res.status(404).json({ error: 'Checkout session not found.' });
    if (rows[0].status !== 'paid') {
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const session = await response.json() as any;
      if (!response.ok) return res.status(502).json({ error: 'Could not verify payment.' });
      if (session.payment_status === 'paid') await markPaid(rows[0].id, session);
    }
    const latest = await sql`SELECT status FROM checkout_orders WHERE stripe_session_id = ${id}`;
    return res.status(200).json({ status: latest[0].status });
  } catch (error) {
    console.error('Checkout status error:', error);
    return res.status(500).json({ error: 'Could not verify payment.' });
  }
}
