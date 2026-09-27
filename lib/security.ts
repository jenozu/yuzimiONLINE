import type { VercelRequest, VercelResponse } from "@vercel/node";

type Bucket = { count: number; resetsAt: number };

const buckets = new Map<string, Bucket>();

function clientAddress(req: VercelRequest) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

export function sameOrigin(req: VercelRequest) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(String(origin)).host.toLowerCase() === String(host).toLowerCase();
  } catch {
    return false;
  }
}

export function requireSameOrigin(req: VercelRequest, res: VercelResponse) {
  if (sameOrigin(req)) return true;
  res.status(403).json({ error: "Request origin was not accepted." });
  return false;
}

export function enforceRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  scope: string,
  limit: number,
  windowMs: number,
) {
  const now = Date.now();
  const key = `${scope}:${clientAddress(req)}`;
  const existing = buckets.get(key);
  const bucket = !existing || existing.resetsAt <= now
    ? { count: 1, resetsAt: now + windowMs }
    : { count: existing.count + 1, resetsAt: existing.resetsAt };
  buckets.set(key, bucket);

  if (buckets.size > 2_000) {
    for (const [candidate, value] of buckets) {
      if (value.resetsAt <= now) buckets.delete(candidate);
    }
  }

  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - bucket.count)));
  if (bucket.count <= limit) return true;

  res.setHeader("Retry-After", String(Math.max(1, Math.ceil((bucket.resetsAt - now) / 1_000))));
  res.status(429).json({ error: "Too many requests. Please wait and try again." });
  return false;
}

export function setApiSecurityHeaders(res: VercelResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}
