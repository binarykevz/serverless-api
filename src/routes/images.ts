import { Elysia, t } from 'elysia';
import { adminAuth } from '../middleware/auth';
import { uploadMedia, deleteMedia, getMedia, listMedia } from '../services/media';
import { getRandomMedia } from '../services/random';
import { paginationQuery, randomQuery } from '../utils/validation';
import { createDb } from '../db/client';
import type { Env } from '../config/env';

export const images = new Elysia({ prefix: '/api/images' })
  .derive(({ env }) => ({ db: createDb(env as Env) }))

  .get('/', async ({ query, db }) => listMedia(db, 'image', query.page, query.pageSize), {
    query: paginationQuery
  })

  .get('/random', async ({ query, db }) => {
    const data = await getRandomMedia(db, 'image', query.limit);
    return { success: true, count: data.length, data };
  }, {
    query: randomQuery
  })

  .get('/:id', async ({ params, db }) => {
    const data = await getMedia(db, 'image', params.id);
    return { success: true, data };
  })

  .use(adminAuth)

  .post('/', async ({ body, env, db }) => {
    const file = body.file;
    const originalFilename = file.name || 'upload.bin';
    const data = await uploadMedia(
      env as Env,
      db,
      'image',
      file,
      originalFilename,
      body.title,
      body.description
    );
    return { success: true, data };
  }, {
    body: t.Object({
      file: t.File(),
      title: t.Optional(t.String()),
      description: t.Optional(t.String())
    })
  })

  .delete('/:id', async ({ params, env, db }) => {
    await deleteMedia(env as Env, db, 'image', params.id);
    return { success: true, message: 'Image deleted successfully' };
  });
