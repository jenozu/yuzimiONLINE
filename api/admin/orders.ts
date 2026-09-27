import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../_handler.js';

export default function orders(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['admin', 'orders'];
  return handler(req, res);
}
