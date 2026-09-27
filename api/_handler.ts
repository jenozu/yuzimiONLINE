import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { neon } from '@neondatabase/serverless';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { validateImageUpload } from '../lib/image-validation.js';
import { assertOrderTransition, isOrderStatus } from '../lib/checkout/order-state.js';
import { ensureOrdersTable, ordersDb, recordRefund, updateOrderStatus } from '../lib/checkout/orders.js';
import { enforceRateLimit, requireSameOrigin, setApiSecurityHeaders } from '../lib/security.js';

const COOKIE_NAME = 'yuzimi_admin_session';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const PRINT_SIZES = [
  '8 × 10 in',
  '11 × 14 in',
  '12 × 18 in',
  '16 × 20 in',
  '18 × 24 in',
  '20 × 30 in',
  '24 × 32 in',
  '24 × 36 in',
] as const;

type ImageInput = { url: string; object_key?: string; alt?: string };

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function db() {
  return neon(env('DATABASE_URL'));
}

let schemaPromise: Promise<void> | undefined;
function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = db();
      await sql`CREATE TABLE IF NOT EXISTS products (
        id text PRIMARY KEY,
        slug text UNIQUE NOT NULL,
        title text NOT NULL,
        description text NOT NULL DEFAULT '',
        price_cents integer NOT NULL CHECK (price_cents >= 0),
        currency text NOT NULL DEFAULT 'USD',
        category text NOT NULL DEFAULT 'Art Print',
        badge text,
        status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS product_images (
        id text PRIMARY KEY,
        product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url text NOT NULL,
        object_key text NOT NULL UNIQUE,
        alt text NOT NULL DEFAULT '',
        position integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS product_variants (
        id text PRIMARY KEY,
        product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        size text NOT NULL,
        price_cents integer NOT NULL CHECK (price_cents >= 0),
        available boolean NOT NULL DEFAULT true,
        position integer NOT NULL DEFAULT 0,
        UNIQUE (product_id, size)
      )`;
      await sql`CREATE INDEX IF NOT EXISTS products_status_created_idx ON products (status, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images (product_id, position)`;
      await sql`CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants (product_id, position)`;
      await sql`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true`;
      await sql`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check`;
      await sql`ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('draft', 'published', 'archived'))`;
    })();
  }
  return schemaPromise;
}

function mapProduct(row: any) {
  const storedImages = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images ?? []);
  const images = storedImages.map((image: any) => ({
    ...image,
    url: `/api/products/image?key=${encodeURIComponent(String(image.object_key || ''))}`,
  }));
  const storedVariants = typeof row.variants === 'string' ? JSON.parse(row.variants) : (row.variants ?? []);
  const variants = PRINT_SIZES.map((size, position) => {
    const stored = storedVariants.find((variant: any) => String(variant.size) === size);
    const largePrintFallback = size === '24 × 32 in'
      ? storedVariants.find((variant: any) => String(variant.size) === '24 × 36 in')
      : undefined;
    const selected = stored ?? largePrintFallback;
    const priceCents = Number(selected?.price_cents ?? row.price_cents);
    return {
      size,
      price_cents: priceCents,
      price: priceCents / 100,
      position,
      available: selected?.available !== false,
    };
  });
  const availableVariants = variants.filter((variant: any) => variant.available);
  const basePriceCents = availableVariants.length
    ? Math.min(...availableVariants.map((variant: any) => variant.price_cents))
    : Number(row.price_cents);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    name: row.title,
    description: row.description,
    price_cents: basePriceCents,
    price: basePriceCents / 100,
    currency: row.currency,
    category: row.category,
    badge: row.badge || undefined,
    status: row.status,
    images,
    variants,
    image: images[0]?.url ?? '',
    additionalImages: images.map((image: any) => image.url),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function queryProducts(status?: 'draft' | 'published' | 'archived') {
  await ensureSchema();
  const sql = db();
  const rows = status
    ? await sql`SELECT p.*,
        COALESCE((SELECT json_agg(json_build_object('id', i.id, 'url', i.url, 'object_key', i.object_key, 'alt', i.alt, 'position', i.position) ORDER BY i.position) FROM product_images i WHERE i.product_id = p.id), '[]'::json) AS images,
        COALESCE((SELECT json_agg(json_build_object('size', v.size, 'price_cents', v.price_cents, 'available', v.available, 'position', v.position) ORDER BY v.position) FROM product_variants v WHERE v.product_id = p.id), '[]'::json) AS variants
      FROM products p WHERE p.status = ${status} ORDER BY p.created_at DESC`
    : await sql`SELECT p.*,
        COALESCE((SELECT json_agg(json_build_object('id', i.id, 'url', i.url, 'object_key', i.object_key, 'alt', i.alt, 'position', i.position) ORDER BY i.position) FROM product_images i WHERE i.product_id = p.id), '[]'::json) AS images,
        COALESCE((SELECT json_agg(json_build_object('size', v.size, 'price_cents', v.price_cents, 'available', v.available, 'position', v.position) ORDER BY v.position) FROM product_variants v WHERE v.product_id = p.id), '[]'::json) AS variants
      FROM products p ORDER BY p.created_at DESC`;
  return rows.map(mapProduct);
}

function parseCookies(header = ''): Record<string, string> {
  const pairs = header.split(';').map((part) => {
    const separator = part.indexOf('=');
    return separator < 0 ? ['', ''] : [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1))];
  });
  return Object.fromEntries(pairs);
}

function signature(payload: string) {
  return createHmac('sha256', env('ADMIN_SESSION_SECRET')).update(payload).digest('base64url');
}

function createSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

function adminPasswordMatches(value: string) {
  const secret = env('ADMIN_SESSION_SECRET');
  const expected = createHmac('sha256', secret).update(env('ADMIN_PASSWORD')).digest();
  const supplied = createHmac('sha256', secret).update(value).digest();
  return timingSafeEqual(expected, supplied);
}

function authenticated(req: VercelRequest) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token) return false;
  const [payload, supplied] = token.split('.');
  if (!payload || !supplied) return false;
  const expected = signature(payload);
  if (expected.length !== supplied.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) return false;
  try {
    return Number(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).exp) > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: VercelRequest, res: VercelResponse) {
  if (authenticated(req)) return true;
  res.status(401).json({ error: 'Admin authentication required.' });
  return false;
}

async function bodyBuffer(req: VercelRequest) {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req as any) {
    const next = Buffer.from(chunk);
    total += next.length;
    if (total > MAX_UPLOAD_BYTES) throw new Error('Upload exceeds the 8 MB limit.');
    chunks.push(next);
  }
  return Buffer.concat(chunks);
}

async function jsonBody(req: VercelRequest): Promise<any> {
  const raw = await bodyBuffer(req);
  try {
    return JSON.parse(raw.toString('utf8') || '{}');
  } catch {
    throw new Error('Invalid JSON body.');
  }
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || randomUUID();
}

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100) || 'image';
}

function r2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env('R2_ACCESS_KEY_ID'), secretAccessKey: env('R2_SECRET_ACCESS_KEY') },
  });
}

async function replaceImages(productId: string, images: ImageInput[]) {
  const sql = db();
  await sql`DELETE FROM product_images WHERE product_id = ${productId}`;
  for (const [position, image] of images.entries()) {
    if (!image?.url) continue;
    await sql`INSERT INTO product_images (id, product_id, url, object_key, alt, position) VALUES (${randomUUID()}, ${productId}, ${image.url}, ${String(image.object_key || image.url)}, ${String(image.alt || '')}, ${position})`;
  }
}

async function replaceVariants(productId: string, variants: Array<{ size: string; priceCents: number; available: boolean; position: number }>) {
  const sql = db();
  await sql`DELETE FROM product_variants WHERE product_id = ${productId}`;
  for (const variant of variants) {
    await sql`INSERT INTO product_variants (id, product_id, size, price_cents, available, position) VALUES (${randomUUID()}, ${productId}, ${variant.size}, ${variant.priceCents}, ${variant.available}, ${variant.position})`;
  }
}

function normalizeProduct(input: any) {
  const title = String(input.title || '').trim();
  const fallbackPriceCents = Number(input.price_cents);
  const suppliedVariants = Array.isArray(input.variants) ? input.variants : [];
  if (!title) throw new Error('Product title is required.');
  if (!suppliedVariants.length && (!Number.isInteger(fallbackPriceCents) || fallbackPriceCents < 0)) {
    throw new Error('price_cents must be a non-negative integer.');
  }
  const variants = PRINT_SIZES.map((size, position) => {
    const supplied = suppliedVariants.find((variant: any) => String(variant?.size) === size);
    const priceCents = suppliedVariants.length ? Number(supplied?.price_cents) : fallbackPriceCents;
    if (!Number.isInteger(priceCents) || priceCents < 0) throw new Error(`Enter a valid price for ${size}.`);
    return { size, priceCents, available: supplied?.available !== false, position };
  });
  const priceCents = Math.min(...variants.map((variant) => variant.priceCents));
  const status = input.status === 'published' ? 'published' : input.status === 'archived' ? 'archived' : 'draft';
  if (status === 'published' && !variants.some((variant) => variant.available)) {
    throw new Error('A published product must have at least one available print size.');
  }
  const images = Array.isArray(input.images) ? input.images as ImageInput[] : [];
  if (status === 'published' && !images.some((image) => image?.object_key?.startsWith('products/'))) {
    throw new Error('A published product must have at least one uploaded image.');
  }
  return {
    title,
    slug: slugify(String(input.slug || title)),
    description: String(input.description || ''),
    priceCents,
    currency: String(input.currency || 'USD').toUpperCase().slice(0, 3),
    category: String(input.category || 'Apparel'),
    badge: input.badge ? String(input.badge) : null,
    status,
    images,
    variants,
  };
}

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiSecurityHeaders(res);
  try {
    const path = Array.isArray(req.query.path) ? req.query.path : typeof req.query.path === 'string' ? req.query.path.split('/') : [];
    const route = path.join('/');
    if (route.startsWith('admin/')) res.setHeader('Cache-Control', 'private, no-store');
    const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(String(req.method));
    if (unsafeMethod && route.startsWith('admin/')) {
      if (!requireSameOrigin(req, res)) return;
      const scope = route === 'admin/login' ? 'admin-login' : route === 'admin/upload' ? 'admin-upload' : 'admin-write';
      const limit = route === 'admin/login' ? 10 : route === 'admin/upload' ? 30 : 120;
      if (!enforceRateLimit(req, res, scope, limit, 15 * 60 * 1000)) return;
    }

    if (req.method === 'POST' && route === 'admin/login') {
      const input = await jsonBody(req);
      if (typeof input.password !== 'string' || !adminPasswordMatches(input.password)) return res.status(401).json({ error: 'Incorrect password.' });
      res.setHeader('Set-Cookie', `${COOKIE_NAME}=${createSession()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
      return res.status(200).json({ authenticated: true });
    }
    if (req.method === 'POST' && route === 'admin/logout') {
      res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
      return res.status(200).json({ authenticated: false });
    }
    if (req.method === 'GET' && route === 'admin/session') return res.status(200).json({ authenticated: authenticated(req) });
    if (req.method === 'GET' && route === 'products/image') {
      const objectKey = typeof req.query.key === 'string' ? req.query.key : '';
      if (!objectKey.startsWith('products/') || objectKey.includes('..')) {
        return res.status(400).json({ error: 'Invalid image key.' });
      }
      try {
        const object = await r2Client().send(new GetObjectCommand({
          Bucket: env('R2_BUCKET_NAME'),
          Key: objectKey,
        }));
        if (!object.Body) return res.status(404).json({ error: 'Image not found.' });
        const bytes = await (object.Body as any).transformToByteArray();
        res.setHeader('Content-Type', object.ContentType || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        if (object.ETag) res.setHeader('ETag', object.ETag);
        return res.status(200).send(Buffer.from(bytes));
      } catch (error: any) {
        if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
          return res.status(404).json({ error: 'Image not found.' });
        }
        throw error;
      }
    }
    if (req.method === 'GET' && route === 'products') return res.status(200).json({ products: await queryProducts('published') });
    if (req.method === 'GET' && path[0] === 'products' && path[1]) {
      const products = await queryProducts('published');
      const product = products.find((item: any) => item.slug === path[1] || item.id === path[1]);
      return product ? res.status(200).json({ product }) : res.status(404).json({ error: 'Product not found.' });
    }

    if (!route.startsWith('admin/') || !requireAdmin(req, res)) return;
    if (req.method === 'GET' && route === 'admin/products') return res.status(200).json({ products: await queryProducts() });
    if (req.method === 'GET' && route === 'admin/orders') {
      await ensureOrdersTable();
      const sql = ordersDb();
      const orders = await sql`SELECT * FROM checkout_orders ORDER BY created_at DESC LIMIT 250`;
      return res.status(200).json({ orders });
    }

    if (req.method === 'POST' && route === 'admin/upload') {
      const contentType = String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
      if (!IMAGE_TYPES.has(contentType)) return res.status(415).json({ error: 'Only JPG, PNG, WebP, and GIF images are accepted.' });
      const body = await bodyBuffer(req);
      if (!body.length) return res.status(400).json({ error: 'The uploaded image is empty.' });
      validateImageUpload(body, contentType);
      const original = typeof req.headers['x-file-name'] === 'string' ? req.headers['x-file-name'] : 'image';
      const objectKey = `products/${randomUUID()}-${safeFileName(original)}`;
      await r2Client().send(new PutObjectCommand({ Bucket: env('R2_BUCKET_NAME'), Key: objectKey, Body: body, ContentType: contentType }));
      return res.status(201).json({ url: `/api/products/image?key=${encodeURIComponent(objectKey)}`, object_key: objectKey });
    }

    if (req.method === 'DELETE' && route === 'admin/upload') {
      const input = await jsonBody(req);
      const objectKey = String(input.object_key || '');
      if (!objectKey.startsWith('products/') || objectKey.includes('..')) return res.status(400).json({ error: 'Invalid object_key.' });
      await r2Client().send(new DeleteObjectCommand({ Bucket: env('R2_BUCKET_NAME'), Key: objectKey }));
      return res.status(204).end();
    }

    if (req.method === 'POST' && route === 'admin/products') {
      await ensureSchema();
      const input = normalizeProduct(await jsonBody(req));
      const sql = db();
      const duplicate = await sql`SELECT id FROM products WHERE slug = ${input.slug}`;
      if (duplicate.length) return res.status(409).json({ error: 'That product slug already exists.' });
      const id = randomUUID();
      await sql`INSERT INTO products (id, slug, title, description, price_cents, currency, category, badge, status) VALUES (${id}, ${input.slug}, ${input.title}, ${input.description}, ${input.priceCents}, ${input.currency}, ${input.category}, ${input.badge}, ${input.status})`;
      await Promise.all([replaceImages(id, input.images), replaceVariants(id, input.variants)]);
      const product = (await queryProducts()).find((item: any) => item.id === id);
      return res.status(201).json({ product });
    }

    if (path[0] === 'admin' && path[1] === 'products' && path[2]) {
      await ensureSchema();
      const id = path[2];
      const sql = db();
      if (req.method === 'DELETE') {
        const rows = await sql`UPDATE products SET status = 'archived', updated_at = now() WHERE id = ${id} RETURNING id`;
        if (!rows.length) return res.status(404).json({ error: 'Product not found.' });
        const product = (await queryProducts()).find((item: any) => item.id === id);
        return res.status(200).json({ product });
      }
      if (req.method === 'PATCH') {
        const input = normalizeProduct(await jsonBody(req));
        const duplicate = await sql`SELECT id FROM products WHERE slug = ${input.slug} AND id <> ${id}`;
        if (duplicate.length) return res.status(409).json({ error: 'That product slug already exists.' });
        const result = await sql`UPDATE products SET slug = ${input.slug}, title = ${input.title}, description = ${input.description}, price_cents = ${input.priceCents}, currency = ${input.currency}, category = ${input.category}, badge = ${input.badge}, status = ${input.status}, updated_at = now() WHERE id = ${id} RETURNING id`;
        if (!result.length) return res.status(404).json({ error: 'Product not found.' });
        await Promise.all([replaceImages(id, input.images), replaceVariants(id, input.variants)]);
        const product = (await queryProducts()).find((item: any) => item.id === id);
        return res.status(200).json({ product });
      }
    }

    if (path[0] === 'admin' && path[1] === 'orders' && path[2]) {
      await ensureOrdersTable();
      const orderId = path[2];
      const sql = ordersDb();
      const currentRows = await sql`SELECT * FROM checkout_orders WHERE id = ${orderId}`;
      const current = currentRows[0];
      if (!current) return res.status(404).json({ error: 'Order not found.' });

      if (req.method === 'PATCH') {
        const input = await jsonBody(req);
        if (!isOrderStatus(input.status)) return res.status(400).json({ error: 'Invalid order status.' });
        if (!['processing', 'fulfilled', 'cancelled'].includes(input.status)) {
          return res.status(400).json({ error: 'Use the dedicated refund action for refunds; this status cannot be set manually.' });
        }
        if (input.status === 'cancelled' && current.status !== 'pending') {
          return res.status(409).json({ error: 'Only unpaid pending orders can be cancelled directly. Refund paid orders instead.' });
        }
        assertOrderTransition(current.status, input.status);
        const order = await updateOrderStatus(orderId, input.status, {
          providerOrderId: input.provider_order_id ? String(input.provider_order_id).slice(0, 200) : null,
          trackingNumber: input.tracking_number ? String(input.tracking_number).slice(0, 200) : null,
          trackingUrl: input.tracking_url ? String(input.tracking_url).slice(0, 500) : null,
        });
        return res.status(200).json({ order });
      }

      if (req.method === 'POST' && path[3] === 'refund') {
        if (!current.payment_intent_id || !['paid', 'processing', 'fulfilled', 'cancelled', 'partially_refunded', 'disputed'].includes(current.status)) {
          return res.status(409).json({ error: 'This order is not eligible for a refund.' });
        }
        const secret = env('STRIPE_SECRET_KEY');
        const response = await fetch('https://api.stripe.com/v1/refunds', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Idempotency-Key': `admin-refund-${orderId}-${current.refunded_cents || 0}`,
          },
          body: new URLSearchParams({ payment_intent: current.payment_intent_id }),
          signal: AbortSignal.timeout(10_000),
        });
        const refund = await response.json() as any;
        if (!response.ok || !refund.id) return res.status(502).json({ error: refund.error?.message || 'Stripe could not create the refund.' });
        await recordRefund(current.payment_intent_id, Number(current.total_cents), String(refund.id));
        const updated = await sql`SELECT * FROM checkout_orders WHERE id = ${orderId}`;
        return res.status(200).json({ order: updated[0] });
      }
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(404).json({ error: 'API route not found.' });
  } catch (error) {
    const requestId = randomUUID();
    console.error('API request failed', { requestId, name: error instanceof Error ? error.name : 'UnknownError', message: error instanceof Error ? error.message : 'Unknown error' });
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    const status = message.includes('cannot move') ? 409 : message.includes('required') || message.includes('must be') || message.includes('Invalid') || message.includes('exceeds') || message.includes('Enter a valid') ? 400 : 500;
    return res.status(status).json({ error: status === 500 ? 'Unexpected server error.' : message, requestId });
  }
}
