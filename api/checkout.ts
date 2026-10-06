import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { ensureOrdersTable, ordersDb } from '../lib/checkout/orders.js';
import { shippingCents } from '../lib/checkout/shipping.js';

type RequestedItem = { id: string; size: string; quantity: number };
type RateBucket = { count: number; resetAt: number };

const checkoutBuckets = new Map<string, RateBucket>();
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000;
const CHECKOUT_LIMIT = 20;

function clientKey(req: VercelRequest) {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return String(first || req.headers['x-real-ip'] || 'unknown').trim().slice(0, 100);
}

function allowCheckout(req: VercelRequest) {
  const key = clientKey(req);
  const now = Date.now();
  const existing = checkoutBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    checkoutBuckets.set(key, { count: 1, resetAt: now + CHECKOUT_WINDOW_MS });
    return true;
  }
  if (existing.count >= CHECKOUT_LIMIT) return false;
  existing.count += 1;
  return true;
}

function storefrontOrigin(req: VercelRequest) {
  const configured = process.env.PUBLIC_STORE_URL?.trim();
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
      throw new Error('Invalid storefront URL configuration.');
    }
    return url.origin;
  }

  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host;
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) throw new Error('Invalid checkout host.');
  return `https://${host}`;
}

export default async function checkout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });
  if (!allowCheckout(req)) return res.status(429).json({ error: 'Too many checkout attempts. Please wait a few minutes and try again.' });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret?.startsWith('sk_test_')) return res.status(503).json({ error: 'Checkout is temporarily unavailable.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const country = String(body?.country || '').toUpperCase();
    const items = body?.items as RequestedItem[];

    if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
      return res.status(400).json({ error: 'Add 1–30 print variants to the cart.' });
    }
    if (!/^[A-Z]{2}$/.test(country)) return res.status(400).json({ error: 'Select a shipping destination.' });

    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    if (!items.every(item =>
      typeof item.id === 'string' &&
      item.id.length <= 100 &&
      typeof item.size === 'string' &&
      item.size.length <= 50 &&
      Number.isInteger(item.quantity) &&
      item.quantity >= 1 &&
      item.quantity <= 50
    ) || count > 100) {
      return res.status(400).json({ error: 'Invalid cart quantity or print size.' });
    }

    const freight = shippingCents(country, count);
    const sql = ordersDb();
    const products = await sql`SELECT p.id, p.title, p.currency, p.price_cents AS base_price_cents,
        v.size, v.price_cents AS variant_price_cents
      FROM products p LEFT JOIN product_variants v ON v.product_id = p.id
      WHERE p.status = 'published'`;

    const lines = items.map(item => {
      const sizes = ['8 × 10 in', '11 × 14 in', '12 × 18 in', '16 × 20 in', '18 × 24 in', '20 × 30 in', '24 × 32 in', '24 × 36 in'];
      if (!sizes.includes(item.size)) throw new Error('A print variant is unavailable.');

      const product = products.find(row => row.id === item.id && row.size === item.size && row.currency === 'USD')
        || (item.size === '24 × 32 in' && products.find(row => row.id === item.id && row.size === '24 × 36 in' && row.currency === 'USD'))
        || products.find(row => row.id === item.id && row.size === null && row.currency === 'USD');

      const price = Number(product?.variant_price_cents ?? product?.base_price_cents);
      if (!product || !Number.isSafeInteger(price) || price < 50) {
        throw new Error('A print variant is unavailable or priced below Stripe’s minimum.');
      }

      return { id: item.id, name: String(product.title), size: item.size, quantity: item.quantity, price_cents: price };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.price_cents * line.quantity, 0);
    const total = subtotal + freight;
    if (!Number.isSafeInteger(total) || total > 99999999) return res.status(400).json({ error: 'Cart total is invalid.' });

    await ensureOrdersTable();
    const orderId = randomUUID();
    await sql`INSERT INTO checkout_orders (id, line_items, country, subtotal_cents, shipping_cents, total_cents)
      VALUES (${orderId}, ${JSON.stringify(lines)}::jsonb, ${country}, ${subtotal}, ${freight}, ${total})`;

    const origin = storefrontOrigin(req);
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
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': orderId
      },
      body: params,
    });

    const session = await response.json() as any;
    if (!response.ok || !session.id?.startsWith('cs_test_') || !session.url) {
      console.error('Stripe test checkout creation failed:', session.error?.message || response.status);
      return res.status(502).json({ error: 'Could not start Stripe checkout. Please try again.' });
    }

    await sql`UPDATE checkout_orders SET stripe_session_id = ${session.id} WHERE id = ${orderId}`;
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : '';
    const clientError = /^(A print variant|Invalid cart|Cart total|Add 1|Select a shipping)/.test(message);
    return res.status(clientError ? 400 : 500).json({
      error: clientError ? message : 'Could not start checkout. Please try again.'
    });
  }
}
