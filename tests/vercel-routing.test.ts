import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

type Rewrite = { source: string; destination: string };
const vercelConfig = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as { rewrites: Rewrite[] };

test('SPA fallback serves browser routes but never intercepts API functions', () => {
  const fallbacks = vercelConfig.rewrites.filter(rewrite => rewrite.destination === '/index.html');
  assert.ok(fallbacks.length > 0, 'Browser routes need an SPA fallback');
  const catches = (path: string) => fallbacks.some(rewrite => new RegExp(`^${rewrite.source}$`).test(path));

  for (const path of ['/collections', '/product/bayonetta', '/admin', '/checkout/success']) {
    assert.equal(catches(path), true, `Browser route ${path} must use SPA fallback`);
  }
  for (const path of ['/api/products', '/api/admin/products', '/api/checkout', '/api/stripe-webhook']) {
    assert.equal(catches(path), false, `API endpoint ${path} must bypass SPA fallback`);
  }
});
