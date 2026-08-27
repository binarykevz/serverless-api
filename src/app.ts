// src/app.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { images } from './routes/images';
import { videos } from './routes/videos';
import { AppError } from './utils/errors';
import type { Env } from './config/env';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/', (c) => c.json({ success: true, message: 'Media API is running on Cloudflare Workers' }));
app.get('/health', (c) => c.json({ success: true, status: 'ok' }));

app.route('/api/images', images);
app.route('/api/videos', videos);

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({
      success: false,
      error: { code: err.code, message: err.message }
    }, err.statusCode as any);
  }
  
  console.error('Unhandled error:', err);
  return c.json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
  }, 500);
});

app.notFound((c) => {
  return c.json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint does not exist' }
  }, 404);
});

export { app };
