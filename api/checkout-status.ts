import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureOrdersTable, markPaid, markPaymentIntentPaid, ordersDb } from '../lib/checkout/orders.js';

export default async function status(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    return res.status(503).json({ error: 'Stripe test checkout is not configured.' });
  }

  const paymentIntentId = typeof req.query.payment_intent === 'string' ? req.query.payment_intent : '';
  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';

  const usePaymentIntent = /^pi_[a-zA-Z0-9_]+$/.test(paymentIntentId) && paymentIntentId.length <= 255;
  const useSession = /^cs_test_[a-zA-Z0-9_]+$/.test(sessionId) && sessionId.length <= 255;
  if (!usePaymentIntent && !useSession) {
    return res.status(400).json({ error: 'Invalid test payment reference.' });
  }

  try {
    await ensureOrdersTable();
    const sql = ordersDb();

    if (usePaymentIntent) {
      const rows = await sql`SELECT id, status FROM checkout_orders WHERE stripe_payment_intent_id = ${paymentIntentId}`;
      if (!rows.length) return res.status(404).json({ error: 'Payment not found.' });

      if (rows[0].status !== 'paid') {
        const response = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
          headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
        });
        const paymentIntent = await response.json() as any;
        if (!response.ok) return res.status(502).json({ error: 'Could not verify payment.' });
        if (paymentIntent.status === 'succeeded') {
          await markPaymentIntentPaid(rows[0].id, paymentIntent);
        }
      }

      const latest = await sql`SELECT status FROM checkout_orders WHERE stripe_payment_intent_id = ${paymentIntentId}`;
      return res.status(200).json({ status: latest[0].status });
    }

    const rows = await sql`SELECT id, status FROM checkout_orders WHERE stripe_session_id = ${sessionId}`;
    if (!rows.length) return res.status(404).json({ error: 'Checkout session not found.' });

    if (rows[0].status !== 'paid') {
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const session = await response.json() as any;
      if (!response.ok) return res.status(502).json({ error: 'Could not verify payment.' });
      if (session.payment_status === 'paid') await markPaid(rows[0].id, session);
    }

    const latest = await sql`SELECT status FROM checkout_orders WHERE stripe_session_id = ${sessionId}`;
    return res.status(200).json({ status: latest[0].status });
  } catch (error) {
    console.error('Checkout status error:', error);
    return res.status(500).json({ error: 'Could not verify payment.' });
  }
}
