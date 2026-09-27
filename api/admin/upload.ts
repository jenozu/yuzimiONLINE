import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../_handler.js';

export default function upload(req: VercelRequest, res: VercelResponse) {
  req.query.path = ['admin', 'upload'];
  return handler(req, res);
}
