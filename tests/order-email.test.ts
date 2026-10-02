import test from "node:test";
import assert from "node:assert/strict";
import { buildOrderConfirmation, orderEmailRecipient } from "../lib/order-email.ts";

const order = {
  id: "12345678-aaaa-bbbb-cccc-1234567890ab",
  line_items: [
    { name: "Bayonetta <Print>", size: "8 × 10 in", quantity: 2, price_cents: 200 },
  ],
  country: "US",
  subtotal_cents: 400,
  shipping_cents: 0,
  total_cents: 400,
  customer_email: "customer@example.com",
};

test("order confirmation includes order summary and escapes HTML", () => {
  const email = buildOrderConfirmation(order);
  assert.match(email.subject, /YUZIMI #12345678/);
  assert.match(email.text, /Bayonetta <Print>/);
  assert.match(email.text, /Total: \$4\.00/);
  assert.match(email.html, /Bayonetta &lt;Print&gt;/);
  assert.doesNotMatch(email.html, /Bayonetta <Print>/);
  assert.match(email.html, />FREE</);
});

test("test recipient overrides the checkout email", () => {
  const previous = process.env.RESEND_TEST_RECIPIENT;
  process.env.RESEND_TEST_RECIPIENT = "owner@example.com";
  assert.equal(orderEmailRecipient(order), "owner@example.com");
  if (previous === undefined) delete process.env.RESEND_TEST_RECIPIENT;
  else process.env.RESEND_TEST_RECIPIENT = previous;
});

test("checkout email is used when no test recipient override exists", () => {
  const previous = process.env.RESEND_TEST_RECIPIENT;
  delete process.env.RESEND_TEST_RECIPIENT;
  assert.equal(orderEmailRecipient(order), "customer@example.com");
  if (previous !== undefined) process.env.RESEND_TEST_RECIPIENT = previous;
});
