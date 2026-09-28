import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const rewrites = config.rewrites ?? [];

function matches(source, path) {
  // Vercel's :name URL parameter matches one non-empty path segment.
  const pattern = source.replace(/:[a-zA-Z][a-zA-Z0-9_]*/g, "[^/]+");
  return new RegExp(`^${pattern}$`).test(path);
}
function rewritesToIndex(path) {
  return rewrites.some(({ source, destination }) =>
    destination === "/index.html" && matches(source, path)
  );
}

test("Every non-root React Router page supports direct visits and payment redirects", () => {
  for (const route of [
    "/admin", "/collections", "/lookbook", "/archive", "/support",
    "/privacy", "/terms", "/security", "/product/bayonetta",
    "/checkout/success", "/checkout/cancel"
  ]) {
    assert.equal(rewritesToIndex(route), true, `Missing SPA route: ${route}`);
  }
});

test("SPA rewrites never catch actual API functions or their subpaths", () => {
  for (const api of [
    "/api/products", "/api/products/image", "/api/admin/login",
    "/api/admin/session", "/api/checkout", "/api/checkout-status",
    "/api/stripe-webhook"
  ]) {
    assert.equal(rewritesToIndex(api), false, `Do not rewrite API endpoint: ${api}`);
  }
});

test("No catch-all rewrites can mask unexpectedly missing pages and functions", () => {
  assert.equal(rewritesToIndex("/api/new-endpoint"), false);
  assert.equal(rewritesToIndex("/nonexistent-route"), false);
});
