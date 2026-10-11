import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const checkoutPage = readFileSync(new URL("../src/pages/Checkout.tsx", import.meta.url), "utf8");
const cartDrawer = readFileSync(new URL("../src/components/CartDrawer.tsx", import.meta.url), "utf8");
const checkoutApi = readFileSync(new URL("../api/checkout.ts", import.meta.url), "utf8");
const statusApi = readFileSync(new URL("../api/checkout-status.ts", import.meta.url), "utf8");
const webhookApi = readFileSync(new URL("../api/stripe-webhook.ts", import.meta.url), "utf8");

test("checkout stays on YUZIMI and uses Stripe Elements", () => {
  assert.match(cartDrawer, /to="\/checkout"/);
  assert.doesNotMatch(cartDrawer, /checkout\.stripe\.com/);
  assert.match(checkoutPage, /https:\/\/js\.stripe\.com\/v3\//);
  assert.match(checkoutPage, /elements\.create\("payment"/);
  assert.match(checkoutPage, /confirmPayment\(/);
});

test("server creates PaymentIntents from validated cart data", () => {
  assert.match(checkoutApi, /\/v1\/payment_intents/);
  assert.doesNotMatch(checkoutApi, /\/v1\/checkout\/sessions/);
  assert.match(checkoutApi, /SELECT p\.id, p\.title, p\.currency/);
  assert.match(checkoutApi, /shippingCents\(country, count\)/);
  assert.match(checkoutApi, /stripe_payment_intent_id/);
});

test("status and webhook handlers support PaymentIntent completion", () => {
  assert.match(statusApi, /payment_intent/);
  assert.match(statusApi, /markPaymentIntentPaid/);
  assert.match(webhookApi, /payment_intent\.succeeded/);
  assert.match(webhookApi, /payment_intent\.payment_failed/);
});
