// src/config/env.ts
import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_AUTH_TOKEN: z.string().min(1),
  ADMIN_API_KEY: z.string().min(16),
  R2_PUBLIC_URL: z.string().url(),
  MAX_IMAGE_SIZE: z.coerce.number().default(10 * 1024 * 1024),
  MAX_VIDEO_SIZE: z.coerce.number().default(100 * 1024 * 1024),
});

export type Env = z.infer<typeof envSchema> & {
  R2: R2Bucket;
};
