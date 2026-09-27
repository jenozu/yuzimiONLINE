import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../_handler.js';

export default function login(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['admin', 'login'];
  return handler(req, res);
}

