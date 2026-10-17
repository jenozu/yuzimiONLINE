import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import { ensureOrdersTable, ordersDb } from '../lib/checkout/orders.js';
import { shippingCents } from '../lib/checkout/shipping.js';

type RequestedItem = { id: string; size: string; quantity: number };
type RateBucket = { count: number; resetAt: number };
type ShippingInput = {
  firstName?: string;
  lastName?: string;
  country?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};
type ContactInput = { email?: string; phone?: string };

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

function clean(value: unknown, max: number) {
  return String(value || '').trim().slice(0, max);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export default async function checkout(req: VercelRequest, res: VercelResponse) {
  if (process.env.YUZIMI_EDITORIAL_PREVIEW === "true") return res.status(403).json({ error: "Transactions and messages are disabled in the editorial preview." });
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required.' });
  if (!allowCheckout(req)) return res.status(429).json({ error: 'Too many checkout attempts. Please wait a few minutes and try again.' });

  const secret = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!secret?.startsWith('sk_test_') || !publishableKey?.startsWith('pk_test_')) {
    return res.status(503).json({ error: 'Checkout is temporarily unavailable.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const items = body?.items as RequestedItem[];
    const shipping = (body?.shipping || {}) as ShippingInput;
    const contact = (body?.contact || {}) as ContactInput;

    if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
      return res.status(400).json({ error: 'Add 1–30 print variants to the cart.' });
    }

    const country = clean(shipping.country, 2).toUpperCase();
    const firstName = clean(shipping.firstName, 60);
    const lastName = clean(shipping.lastName, 60);
    const name = `${firstName} ${lastName}`.trim();
    const line1 = clean(shipping.line1, 160);
    const line2 = clean(shipping.line2, 160);
    const city = clean(shipping.city, 100);
    const state = clean(shipping.state, 100);
    const postalCode = clean(shipping.postalCode, 32);
    const email = clean(contact.email, 254).toLowerCase();
    const phone = clean(contact.phone, 40);

    if (!/^[A-Z]{2}$/.test(country)) return res.status(400).json({ error: 'Select a shipping destination.' });
    if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!firstName || !lastName || !line1 || !city || !postalCode || ((country === 'US' || country === 'CA') && !state)) {
      return res.status(400).json({ error: 'Complete the required shipping address fields.' });
    }

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
    if (!Number.isSafeInteger(total) || total < 50 || total > 99999999) {
      return res.status(400).json({ error: 'Cart total is invalid.' });
    }

    await ensureOrdersTable();
    const orderId = randomUUID();
    const shippingDetails = {
      name,
      phone: phone || null,
      address: {
        line1,
        line2: line2 || null,
        city,
        state: state || null,
        postal_code: postalCode,
        country,
      },
    };

    await sql`INSERT INTO checkout_orders
      (id, line_items, country, subtotal_cents, shipping_cents, total_cents, customer_email, shipping_details)
      VALUES (
        ${orderId},
        ${JSON.stringify(lines)}::jsonb,
        ${country},
        ${subtotal},
        ${freight},
        ${total},
        ${email},
        ${JSON.stringify(shippingDetails)}::jsonb
      )`;

    const params = new URLSearchParams({
      amount: String(total),
      currency: 'usd',
      'payment_method_types[0]': 'card',
      receipt_email: email,
      'metadata[orderId]': orderId,
      'metadata[country]': country,
      'shipping[name]': name,
      'shipping[address][line1]': line1,
      'shipping[address][city]': city,
      'shipping[address][postal_code]': postalCode,
      'shipping[address][country]': country,
    });
    if (line2) params.set('shipping[address][line2]', line2);
    if (state) params.set('shipping[address][state]', state);
    if (phone) params.set('shipping[phone]', phone);

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': orderId,
      },
      body: params,
    });

    const paymentIntent = await response.json() as any;
    if (!response.ok || !paymentIntent.id?.startsWith('pi_') || !paymentIntent.client_secret) {
      console.error('Stripe test payment intent creation failed:', paymentIntent.error?.message || response.status);
      await sql`UPDATE checkout_orders SET status = 'failed' WHERE id = ${orderId} AND status = 'pending'`;
      return res.status(502).json({ error: 'Could not prepare payment. Please try again.' });
    }

    await sql`UPDATE checkout_orders
      SET stripe_payment_intent_id = ${paymentIntent.id}
      WHERE id = ${orderId}`;

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      publishableKey,
      paymentIntentId: paymentIntent.id,
      orderId,
      subtotalCents: subtotal,
      shippingCents: freight,
      totalCents: total,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : '';
    const clientError = /^(A print variant|Invalid cart|Cart total|Add 1|Select a shipping|Complete the required|Enter a valid)/.test(message);
    return res.status(clientError ? 400 : 500).json({
      error: clientError ? message : 'Could not prepare payment. Please try again.',
    });
  }
}
