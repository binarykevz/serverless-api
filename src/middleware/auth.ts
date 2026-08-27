// src/middleware/auth.ts
import { Context, Next } from 'hono';
import { unauthorized, forbidden } from '../utils/errors';
import type { Env } from '../config/env';

export const adminAuth = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw unauthorized('Authentication is missing or invalid.');
  }
  
  const token = authHeader.substring(7);
  if (token !== c.env.ADMIN_API_KEY) {
    throw forbidden('Invalid admin credentials.');
  }
  
  await next();
};
