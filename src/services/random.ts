import { eq, sql } from 'drizzle-orm';
import { media } from '../db/schema';
import type { Db } from '../db/client';

export async function getRandomMedia(db: Db, type: 'image' | 'video', limit: number) {
  return db.select().from(media)
    .where(eq(media.type, type))
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}
