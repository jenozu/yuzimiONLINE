import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../_handler.js';

export default function logout(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['admin', 'logout'];
  return handler(req, res);
}

