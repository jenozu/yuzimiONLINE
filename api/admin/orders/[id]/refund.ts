import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../../_handler.js';

export default function refund(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['admin', 'orders', String(req.query.id || ''), 'refund'];
  return handler(req, res);
}
