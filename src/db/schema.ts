import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const media = sqliteTable('media', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: text('type', { enum: ['image', 'video'] }).notNull(),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  r2Key: text('r2_key').notNull().unique(),
  url: text('url').notNull(),
  title: text('title'),
  description: text('description'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  typeIdx: index('type_idx').on(table.type),
  createdIdx: index('created_idx').on(table.createdAt),
  typeCreatedIdx: index('type_created_idx').on(table.type, table.createdAt),
}));

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
