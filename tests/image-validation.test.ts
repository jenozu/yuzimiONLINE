import assert from "node:assert/strict";
import test from "node:test";
import { validateImageUpload } from "../lib/image-validation.ts";

const onePixelPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

test("image validation reads actual file signatures and dimensions", () => {
  const result = validateImageUpload(onePixelPng, "image/png");
  assert.deepEqual(result, { width: 1, height: 1, type: "png" });
});

test("image validation rejects MIME spoofing and invalid bytes", () => {
  assert.throws(() => validateImageUpload(onePixelPng, "image/jpeg"), /does not match/);
  assert.throws(() => validateImageUpload(Buffer.from("not an image"), "image/png"), /not a valid image/);
});
