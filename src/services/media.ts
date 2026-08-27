import { eq, desc, sql } from 'drizzle-orm';
import { media } from '../db/schema';
import { uploadToR2, deleteFromR2 } from './r2';
import type { Env } from '../config/env';
import type { Db } from '../db/client';
import {
  notFound,
  tooLarge,
  unsupportedMediaType,
  badRequest,
  internalError,
} from '../utils/errors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function uploadMedia(
  env: Env,
  db: Db,
  type: 'image' | 'video',
  file: File | Blob,
  originalFilename: string,
  title?: string,
  description?: string
) {
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
  const maxSize = type === 'image'
    ? parseInt(env.MAX_IMAGE_SIZE, 10)
    : parseInt(env.MAX_VIDEO_SIZE, 10);

  const mimeType = (file as any).type || '';

  if (!mimeType || !allowedTypes.includes(mimeType)) {
    throw unsupportedMediaType(`Unsupported media type. Allowed: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    throw tooLarge(`File exceeds maximum size of ${maxSize} bytes`);
  }

  const ext = originalFilename.split('.').pop() || (type === 'image' ? 'bin' : 'bin');
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const r2Key = `${type}s/${crypto.randomUUID()}.${safeExt}`;
  const url = `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${r2Key}`;

  const arrayBuffer = await file.arrayBuffer();

  try {
    await uploadToR2(env, r2Key, arrayBuffer, mimeType);
  } catch (err) {
    console.error('R2 Upload failed:', err);
    throw badRequest('Failed to upload file to storage');
  }

  const id = crypto.randomUUID();
  const filename = r2Key.split('/').pop()!;

  const dbInsert = {
    id,
    type,
    filename,
    originalFilename,
    mimeType,
    size: file.size,
    r2Key,
    url,
    title: title || null,
    description: description || null,
  };

  try {
    await db.insert(media).values(dbInsert);
  } catch (err) {
    console.error('DB Insert failed, rolling back R2 upload:', err);
    try {
      await deleteFromR2(env, r2Key);
    } catch (cleanupErr) {
      console.error('Failed to clean up R2 object:', cleanupErr);
    }
    throw badRequest('Failed to save media metadata');
  }

  return dbInsert;
}

export async function deleteMedia(
  env: Env,
  db: Db,
  type: 'image' | 'video',
  id: string
) {
  const existing = await db.select().from(media).where(eq(media.id, id)).limit(1);

  if (existing.length === 0) {
    throw notFound('Media not found');
  }

  const record = existing[0];
  if (record.type !== type) {
    throw notFound(`Media is not a ${type}`);
  }

  try {
    await deleteFromR2(env, record.r2Key);
  } catch (err) {
    console.error('R2 Deletion failed:', err);
    throw internalError('Failed to delete media from storage');
  }

  await db.delete(media).where(eq(media.id, id));
}

export async function getMedia(db: Db, type: 'image' | 'video', id: string) {
  const existing = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (existing.length === 0 || existing[0].type !== type) {
    throw notFound('Media not found');
  }
  return existing[0];
}

export async function listMedia(db: Db, type: 'image' | 'video', page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;

  const [results, countResult] = await Promise.all([
    db.select().from(media)
      .where(eq(media.type, type))
      .orderBy(desc(media.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(media).where(eq(media.type, type))
  ]);

  return {
    success: true,
    data: results,
    meta: {
      page,
      pageSize,
      total: Number(countResult[0].count)
    }
  };
}
