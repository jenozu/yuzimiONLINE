import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../_handler.js';

export default function product(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['admin', 'products', String(req.query.id || '')];
  return handler(req, res);
}
