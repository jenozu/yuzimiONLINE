import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./_handler.js";

export default function apiRoute(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
