import assert from "node:assert/strict";
import test from "node:test";
import { subtotalCents, totalCents } from "../lib/checkout/money.ts";
import { shippingCents } from "../lib/checkout/shipping.ts";
import { validateCheckoutRequest } from "../lib/checkout/validation.ts";

test("money totals use integer cents", () => {
  const subtotal = subtotalCents([
    { price_cents: 1999, quantity: 2 },
    { price_cents: 2500, quantity: 1 },
  ]);
  assert.equal(subtotal, 6498);
  assert.equal(totalCents(subtotal, 999), 7497);
});

test("money rejects invalid values", () => {
  assert.throws(() => subtotalCents([{ price_cents: 12.5, quantity: 1 }]), /Invalid money line/);
  assert.throws(() => totalCents(100, -1), /Invalid cart total/);
});

test("shipping applies first and additional-item rates", () => {
  assert.equal(shippingCents("US", 3), 0);
  assert.equal(shippingCents("CA", 3), 1499);
  assert.equal(shippingCents("GB", 2), 1618);
  assert.throws(() => shippingCents("RU", 1), /Unsupported/);
});

test("checkout validation accepts known print sizes", () => {
  const result = validateCheckoutRequest("us", [
    { id: "print-1", size: "24 × 32 in", quantity: 2 },
  ]);
  assert.equal(result.country, "US");
  assert.equal(result.count, 2);
});

test("checkout validation rejects unknown sizes and abusive quantities", () => {
  assert.throws(() => validateCheckoutRequest("US", [{ id: "print-1", size: "XL", quantity: 1 }]), /Invalid cart/);
  assert.throws(() => validateCheckoutRequest("US", [{ id: "print-1", size: "8 × 10 in", quantity: 51 }]), /Invalid cart/);
  assert.throws(() => validateCheckoutRequest("USA", [{ id: "print-1", size: "8 × 10 in", quantity: 1 }]), /destination/);
});
