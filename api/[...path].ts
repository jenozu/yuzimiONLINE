import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { neon } from '@neondatabase/serverless';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'yuzimi_admin_session';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

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
        category text NOT NULL DEFAULT 'Apparel',
        badge text,
        status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
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
      await sql`CREATE INDEX IF NOT EXISTS products_status_created_idx ON products (status, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images (product_id, position)`;
    })();
  }
  return schemaPromise;
}

function mapProduct(row: any) {
  const images = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images ?? []);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    name: row.title,
    description: row.description,
    price_cents: Number(row.price_cents),
    price: Number(row.price_cents) / 100,
    currency: row.currency,
    category: row.category,
    badge: row.badge || undefined,
    status: row.status,
    images,
    image: images[0]?.url ?? '',
    additionalImages: images.map((image: any) => image.url),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function queryProducts(status?: 'draft' | 'published') {
  await ensureSchema();
  const sql = db();
  const rows = status
    ? await sql`SELECT p.*, COALESCE(json_agg(json_build_object('id', i.id, 'url', i.url, 'object_key', i.object_key, 'alt', i.alt, 'position', i.position) ORDER BY i.position) FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS images FROM products p LEFT JOIN product_images i ON i.product_id = p.id WHERE p.status = ${status} GROUP BY p.id ORDER BY p.created_at DESC`
    : await sql`SELECT p.*, COALESCE(json_agg(json_build_object('id', i.id, 'url', i.url, 'object_key', i.object_key, 'alt', i.alt, 'position', i.position) ORDER BY i.position) FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS images FROM products p LEFT JOIN product_images i ON i.product_id = p.id GROUP BY p.id ORDER BY p.created_at DESC`;
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

function normalizeProduct(input: any) {
  const title = String(input.title || '').trim();
  const priceCents = Number(input.price_cents);
  if (!title) throw new Error('Product title is required.');
  if (!Number.isInteger(priceCents) || priceCents < 0) throw new Error('price_cents must be a non-negative integer.');
  return {
    title,
    slug: slugify(String(input.slug || title)),
    description: String(input.description || ''),
    priceCents,
    currency: String(input.currency || 'USD').toUpperCase().slice(0, 3),
    category: String(input.category || 'Apparel'),
    badge: input.badge ? String(input.badge) : null,
    status: input.status === 'published' ? 'published' : 'draft',
    images: Array.isArray(input.images) ? input.images as ImageInput[] : [],
  };
}

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = Array.isArray(req.query.path) ? req.query.path : typeof req.query.path === 'string' ? req.query.path.split('/') : [];
    const route = path.join('/');

    if (req.method === 'POST' && route === 'admin/login') {
      const input = await jsonBody(req);
      if (typeof input.password !== 'string' || input.password !== env('ADMIN_PASSWORD')) return res.status(401).json({ error: 'Incorrect password.' });
      res.setHeader('Set-Cookie', `${COOKIE_NAME}=${createSession()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`);
      return res.status(200).json({ authenticated: true });
    }
    if (req.method === 'POST' && route === 'admin/logout') {
      res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
      return res.status(200).json({ authenticated: false });
    }
    if (req.method === 'GET' && route === 'admin/session') return res.status(200).json({ authenticated: authenticated(req) });
    if (req.method === 'GET' && route === 'products') return res.status(200).json({ products: await queryProducts('published') });
    if (req.method === 'GET' && path[0] === 'products' && path[1]) {
      const products = await queryProducts('published');
      const product = products.find((item: any) => item.slug === path[1] || item.id === path[1]);
      return product ? res.status(200).json({ product }) : res.status(404).json({ error: 'Product not found.' });
    }

    if (!route.startsWith('admin/') || !requireAdmin(req, res)) return;
    if (req.method === 'GET' && route === 'admin/products') return res.status(200).json({ products: await queryProducts() });

    if (req.method === 'POST' && route === 'admin/upload') {
      const contentType = String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
      if (!IMAGE_TYPES.has(contentType)) return res.status(415).json({ error: 'Only JPG, PNG, WebP, and GIF images are accepted.' });
      const body = await bodyBuffer(req);
      if (!body.length) return res.status(400).json({ error: 'The uploaded image is empty.' });
      const original = typeof req.headers['x-file-name'] === 'string' ? req.headers['x-file-name'] : 'image';
      const objectKey = `products/${randomUUID()}-${safeFileName(original)}`;
      await r2Client().send(new PutObjectCommand({ Bucket: env('R2_BUCKET_NAME'), Key: objectKey, Body: body, ContentType: contentType }));
      return res.status(201).json({ url: `${env('R2_PUBLIC_URL').replace(/\/$/, '')}/${objectKey}`, object_key: objectKey });
    }

    if (req.method === 'DELETE' && route === 'admin/upload') {
      const input = await jsonBody(req);
      if (!input.object_key) return res.status(400).json({ error: 'object_key is required.' });
      await r2Client().send(new DeleteObjectCommand({ Bucket: env('R2_BUCKET_NAME'), Key: String(input.object_key) }));
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
      await replaceImages(id, input.images);
      const product = (await queryProducts()).find((item: any) => item.id === id);
      return res.status(201).json({ product });
    }

    if (path[0] === 'admin' && path[1] === 'products' && path[2]) {
      await ensureSchema();
      const id = path[2];
      const sql = db();
      if (req.method === 'DELETE') {
        const images = await sql`SELECT object_key FROM product_images WHERE product_id = ${id}`;
        await sql`DELETE FROM products WHERE id = ${id}`;
        await Promise.all(images.map((image: any) => r2Client().send(new DeleteObjectCommand({ Bucket: env('R2_BUCKET_NAME'), Key: image.object_key })).catch(() => undefined)));
        return res.status(204).end();
      }
      if (req.method === 'PATCH') {
        const input = normalizeProduct(await jsonBody(req));
        const duplicate = await sql`SELECT id FROM products WHERE slug = ${input.slug} AND id <> ${id}`;
        if (duplicate.length) return res.status(409).json({ error: 'That product slug already exists.' });
        const result = await sql`UPDATE products SET slug = ${input.slug}, title = ${input.title}, description = ${input.description}, price_cents = ${input.priceCents}, currency = ${input.currency}, category = ${input.category}, badge = ${input.badge}, status = ${input.status}, updated_at = now() WHERE id = ${id} RETURNING id`;
        if (!result.length) return res.status(404).json({ error: 'Product not found.' });
        await replaceImages(id, input.images);
        const product = (await queryProducts()).find((item: any) => item.id === id);
        return res.status(200).json({ product });
      }
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(404).json({ error: 'API route not found.' });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    const status = message.includes('required') || message.includes('must be') || message.includes('Invalid') || message.includes('exceeds') ? 400 : 500;
    return res.status(status).json({ error: message });
  }
}
