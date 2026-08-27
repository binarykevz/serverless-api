import { Elysia } from 'elysia';

export const health = new Elysia()
  .get('/', () => ({
    success: true,
    message: 'Media API is running on Cloudflare Workers'
  }))
  .get('/health', () => ({
    success: true,
    status: 'ok'
  }));
