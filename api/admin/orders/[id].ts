import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../_handler.js';

export default function order(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['admin', 'orders', String(req.query.id || '')];
  return handler(req, res);
}
