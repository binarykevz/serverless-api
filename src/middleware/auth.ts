import { Elysia } from 'elysia';
import type { Env } from '../config/env';
import { unauthorized, forbidden } from '../utils/errors';

export const adminAuth = new Elysia({ name: 'adminAuth' })
  .derive(({ headers, env }: any) => {
    const e = env as Env;
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw unauthorized('Authentication is missing or invalid.');
    }
    const token = authHeader.substring(7);
    if (token !== e.ADMIN_API_KEY) {
      throw forbidden('Invalid admin credentials.');
    }
    return { isAdmin: true };
  });
