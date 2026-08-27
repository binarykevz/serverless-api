// src/routes/videos.ts
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { adminAuth } from '../middleware/auth';
import { uploadMedia, deleteMedia, getMedia, listMedia } from '../services/media';
import { getRandomMedia } from '../services/random';
import type { Env } from '../config/env';
import { createDb } from '../db/client';

const videos = new Hono<{ Bindings: Env }>();

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

const randomSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(5)
});

videos.get('/', zValidator('query', paginationSchema, (c) => {
  const db = createDb(c.env);
  const { page, pageSize } = c.req.valid('query');
  return listMedia(db, 'video', page, pageSize);
}));

videos.get('/random', zValidator('query', randomSchema, async (c) => {
  const db = createDb(c.env);
  const { limit } = c.req.valid('query');
  const data = await getRandomMedia(db, 'video', limit);
  return c.json({ success: true, count: data.length, data });
}));

videos.get('/:id', async (c) => {
  const db = createDb(c.env);
  const id = c.req.param('id');
  const data = await getMedia(db, 'video', id);
  return c.json({ success: true, data });
});

videos.post('/', adminAuth, async (c) => {
  const db = createDb(c.env);
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  const title = body['title'] as string | undefined;
  const description = body['description'] as string | undefined;

  if (!file || !(file instanceof File)) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'No file provided' } }, 400);
  }

  const data = await uploadMedia(c.env, db, 'video', file, file.name, title, description);
  return c.json({ success: true, data }, 201);
});

videos.delete('/:id', adminAuth, async (c) => {
  const db = createDb(c.env);
  const id = c.req.param('id');
  await deleteMedia(c.env, db, 'video', id);
  return c.json({ success: true, message: 'Video deleted successfully' });
});

export { videos };
