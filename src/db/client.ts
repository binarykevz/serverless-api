import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import type { Env } from '../config/env';
import * as schema from './schema';

export function createDb(env: Env) {
  const client = createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
