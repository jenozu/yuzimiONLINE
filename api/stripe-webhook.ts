import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { markPaid, ordersDb, recordRefund, recordStripeEvent, releaseStripeEvent, updateOrderStatus } from '../lib/checkout/orders.js';
import { setApiSecurityHeaders } from '../lib/security.js';

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
  setApiSecurityHeaders(res);
  if (req.method !== 'POST') return res.status(405).end();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret?.startsWith('whsec_')) return res.status(503).end();
  let claimedEventId = '';
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
    const liveMode = Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_'));
    if (typeof event.id !== 'string' || !event.id.startsWith('evt_') || event.livemode !== liveMode) return res.status(400).end();
    const object = event.data?.object;
    const claimed = await recordStripeEvent(event.id, event.type, object?.id);
    if (!claimed) return res.status(200).json({ received: true, duplicate: true });
    claimedEventId = event.id;

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = object;
      if (session.metadata?.orderId && session.id?.startsWith(liveMode ? 'cs_live_' : 'cs_test_')) {
        const updated = await markPaid(session.metadata.orderId, session);
        if (!updated && session.payment_status === 'paid') throw new Error('Paid Stripe session did not reconcile with its order.');
      }
    }
    if (event.type === 'checkout.session.async_payment_failed') {
      const session = object;
      if (session.metadata?.orderId) {
        await updateOrderStatus(session.metadata.orderId, 'failed').catch(() => null);
      }
    }
    if (event.type === 'checkout.session.expired' && object?.metadata?.orderId) {
      await updateOrderStatus(object.metadata.orderId, 'expired').catch(() => null);
    }
    if (event.type === 'charge.refunded' && object?.payment_intent) {
      const refundId = object.refunds?.data?.[object.refunds.data.length - 1]?.id;
      await recordRefund(String(object.payment_intent), Number(object.amount_refunded || 0), refundId ? String(refundId) : undefined);
    }
    if (event.type === 'charge.dispute.created' && object?.payment_intent) {
      const sql = ordersDb();
      await sql`UPDATE checkout_orders SET status = 'disputed', updated_at = now()
        WHERE payment_intent_id = ${String(object.payment_intent)}
          AND status IN ('paid', 'processing', 'fulfilled', 'partially_refunded')`;
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    if (claimedEventId) await releaseStripeEvent(claimedEventId).catch(() => undefined);
    console.error('Stripe webhook error:', error);
    return res.status(500).end();
  }
}
