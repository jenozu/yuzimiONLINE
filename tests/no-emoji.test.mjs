import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const sourceDirs = ["src", "api", "lib", "tests"];
const sourceExtensions = /\.(?:tsx?|jsx?|mjs|css|html)$/i;
const pictographic = /[\p{Extended_Pictographic}\uFE0E\uFE0F]/u;

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return filesIn(file);
    return sourceExtensions.test(file) ? [file] : [];
  });
}

test("Application source contains no emoji or pictographic Unicode characters", () => {
  const matches = [...sourceDirs.flatMap(filesIn), "index.html"]
    .filter(file => pictographic.test(readFileSync(file, "utf8")));
  assert.deepEqual(matches, [], "Replace emoji characters with vector icons or plain text.");
});
