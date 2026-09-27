import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { ensureOrdersTable, ordersDb } from '../lib/checkout/orders.js';
import { shippingCents } from '../lib/checkout/shipping.js';
import { enforceRateLimit, requireSameOrigin, setApiSecurityHeaders } from '../lib/security.js';
import { subtotalCents, totalCents } from '../lib/checkout/money.js';
import { validateCheckoutRequest } from '../lib/checkout/validation.js';

export default async function checkout(req: VercelRequest, res: VercelResponse) {
  setApiSecurityHeaders(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });
  if (!enforceRateLimit(req, res, 'checkout', 20, 10 * 60 * 1000) || !requireSameOrigin(req, res)) return;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith('sk_test_')) return res.status(503).json({ error: 'Stripe test checkout is not configured with a test secret key.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { country, items, count } = validateCheckoutRequest(body?.country, body?.items);
    const freight = shippingCents(country, count);
    const sql = ordersDb();
    await sql`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true`;
    const products = await sql`SELECT p.id, p.title, p.currency, p.price_cents AS base_price_cents,
        v.size, v.price_cents AS variant_price_cents, v.available AS variant_available
      FROM products p LEFT JOIN product_variants v ON v.product_id = p.id
      WHERE p.status = 'published'`;
    const lines = items.map(item => {
      const product = products.find(row => row.id === item.id && row.size === item.size && row.currency === 'USD' && row.variant_available !== false);
      const price = Number(product?.variant_price_cents ?? product?.base_price_cents);
      if (!product || !Number.isSafeInteger(price) || price < 50) throw new Error('A print variant is unavailable or priced below Stripe’s minimum.');
      return { id: item.id, name: String(product.title), size: item.size, quantity: item.quantity, price_cents: price };
    });
    const subtotal = subtotalCents(lines);
    const total = totalCents(subtotal, freight);
    await ensureOrdersTable();
    const orderId = randomUUID();
    await sql`INSERT INTO checkout_orders (id, line_items, country, subtotal_cents, shipping_cents, total_cents)
      VALUES (${orderId}, ${JSON.stringify(lines)}::jsonb, ${country}, ${subtotal}, ${freight}, ${total})`;

    const origin = String(req.headers.origin || '');
    if (!/^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin)) return res.status(400).json({ error: 'Invalid checkout origin.' });
    const params = new URLSearchParams({
      mode: 'payment',
      'payment_method_types[0]': 'card',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      client_reference_id: orderId,
      'metadata[orderId]': orderId,
      'metadata[country]': country,
      'shipping_address_collection[allowed_countries][0]': country,
      'shipping_options[0][shipping_rate_data][type]': 'fixed_amount',
      'shipping_options[0][shipping_rate_data][fixed_amount][amount]': String(freight),
      'shipping_options[0][shipping_rate_data][fixed_amount][currency]': 'usd',
      'shipping_options[0][shipping_rate_data][display_name]': country === 'US' ? 'Free US shipping' : 'Standard shipping',
    });
    lines.forEach((line, i) => {
      params.set(`line_items[${i}][price_data][currency]`, 'usd');
      params.set(`line_items[${i}][price_data][unit_amount]`, String(line.price_cents));
      params.set(`line_items[${i}][price_data][product_data][name]`, `${line.name} — ${line.size}`);
      params.set(`line_items[${i}][quantity]`, String(line.quantity));
    });
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': orderId },
      body: params,
      signal: AbortSignal.timeout(10_000),
    });
    const session = await response.json() as any;
    if (!response.ok || !session.id?.startsWith('cs_test_') || !session.url) {
      console.error('Stripe test checkout creation failed:', session.error?.message || response.status);
      return res.status(502).json({ error: session.error?.message || 'Could not start Stripe test checkout.' });
    }
    await sql`UPDATE checkout_orders SET stripe_session_id = ${session.id} WHERE id = ${orderId}`;
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Could not start checkout.';
    const status = /Invalid|unavailable|Unsupported|Select|Add 1/.test(message) ? 400 : 500;
    return res.status(status).json({ error: status === 400 ? message : 'Could not start checkout.' });
  }
}
