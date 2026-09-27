import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from './_handler.js';

export default function products(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['products'];
  return handler(req, res);
}

