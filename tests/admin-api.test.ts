import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import handler from "../api/_handler.ts";

function request(method: string, route: string[], body?: unknown, cookie?: string) {
  const stream = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))]) as any;
  stream.method = method;
  stream.query = { path: route };
  stream.headers = {
    host: "shop.example.test",
    origin: "https://shop.example.test",
    ...(cookie ? { cookie } : {}),
    "x-forwarded-for": `192.0.2.${Math.floor(Math.random() * 200) + 1}`,
  };
  stream.socket = { remoteAddress: "192.0.2.1" };
  return stream;
}

function response() {
  const headers = new Map<string, unknown>();
  const result: any = {
    statusCode: 200,
    body: undefined,
    setHeader(name: string, value: unknown) { headers.set(name.toLowerCase(), value); return result; },
    status(code: number) { result.statusCode = code; return result; },
    json(value: unknown) { result.body = value; return result; },
    send(value: unknown) { result.body = value; return result; },
    end() { return result; },
    getHeader(name: string) { return headers.get(name.toLowerCase()); },
  };
  return result;
}

test("admin login issues a signed session accepted by the session endpoint", async () => {
  process.env.ADMIN_PASSWORD = "test-password";
  process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef";

  const loginResponse = response();
  await handler(request("POST", ["admin", "login"], { password: "test-password" }), loginResponse);
  assert.equal(loginResponse.statusCode, 200);
  assert.equal(loginResponse.body.authenticated, true);
  const setCookie = String(loginResponse.getHeader("set-cookie"));
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);

  const sessionResponse = response();
  await handler(request("GET", ["admin", "session"], undefined, setCookie.split(";")[0]), sessionResponse);
  assert.deepEqual(sessionResponse.body, { authenticated: true });
});

test("admin login rejects an incorrect password", async () => {
  process.env.ADMIN_PASSWORD = "test-password";
  process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef";
  const result = response();
  await handler(request("POST", ["admin", "login"], { password: "wrong" }), result);
  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { error: "Incorrect password." });
});

test("admin mutations reject cross-origin requests", async () => {
  process.env.ADMIN_PASSWORD = "test-password";
  process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef";
  const req = request("POST", ["admin", "login"], { password: "test-password" });
  req.headers.origin = "https://attacker.example";
  const result = response();
  await handler(req, result);
  assert.equal(result.statusCode, 403);
  assert.deepEqual(result.body, { error: "Request origin was not accepted." });
});
