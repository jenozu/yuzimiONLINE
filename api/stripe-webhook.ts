import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { markPaid, ordersDb } from '../lib/checkout/orders.js';

export const config = { api: { bodyParser: false } };

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req as any) {
    const bytes = Buffer.from(chunk);
    size += bytes.length;
    if (size > 1024 * 1024) throw new Error('Webhook payload too large.');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}

export default async function webhook(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret?.startsWith('whsec_')) return res.status(503).end();
  try {
    const raw = await rawBody(req);
    const signature = String(req.headers['stripe-signature'] || '');
    const timestamp = signature.match(/(?:^|,)t=(\d+)/)?.[1];
    const candidates = [...signature.matchAll(/(?:^|,)v1=([a-f0-9]{64})/g)].map(match => match[1]);
    if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 || !candidates.length) return res.status(400).end();
    const expected = createHmac('sha256', secret).update(`${timestamp}.${raw.toString('utf8')}`).digest();
    const valid = candidates.some(candidate => timingSafeEqual(Buffer.from(candidate, 'hex'), expected));
    if (!valid) return res.status(400).end();
    const event = JSON.parse(raw.toString('utf8'));
    if (!event.livemode && (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded')) {
      const session = event.data.object;
      if (session.metadata?.orderId && session.id?.startsWith('cs_test_')) {
        const updated = await markPaid(session.metadata.orderId, session);
        if (!updated && session.payment_status === 'paid') return res.status(500).json({ error: 'Order was not recorded; Stripe will retry.' });
      }
    }
    if (!event.livemode && event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object;
      if (session.metadata?.orderId) {
        const sql = ordersDb();
        await sql`UPDATE checkout_orders SET status = 'failed'
          WHERE id = ${session.metadata.orderId} AND stripe_session_id = ${session.id} AND status = 'pending'`;
      }
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(500).end();
  }
}
