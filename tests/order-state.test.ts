import assert from "node:assert/strict";
import test from "node:test";
import { assertOrderTransition, canTransitionOrder, isOrderStatus } from "../lib/checkout/order-state.ts";

test("paid orders follow the fulfillment lifecycle", () => {
  assert.equal(canTransitionOrder("pending", "paid"), true);
  assert.equal(canTransitionOrder("paid", "processing"), true);
  assert.equal(canTransitionOrder("processing", "fulfilled"), true);
});

test("terminal order states reject invalid transitions", () => {
  assert.equal(canTransitionOrder("refunded", "fulfilled"), false);
  assert.throws(() => assertOrderTransition("failed", "paid"), /cannot move/);
});

test("order status parser rejects arbitrary strings", () => {
  assert.equal(isOrderStatus("disputed"), true);
  assert.equal(isOrderStatus("shipped"), false);
  assert.equal(isOrderStatus(null), false);
});
