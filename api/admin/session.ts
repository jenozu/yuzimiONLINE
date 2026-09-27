import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../_handler.js';

export default function session(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['admin', 'session'];
  return handler(req, res);
}

