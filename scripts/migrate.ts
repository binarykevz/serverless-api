import 'dotenv/config';
import { createClient } from '@libsql/client';

async function migrate() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Missing DATABASE_URL or DATABASE_AUTH_TOKEN');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  console.log('Creating media table...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('image', 'video')),
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      r2_key TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      title TEXT,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`CREATE INDEX IF NOT EXISTS media_type_idx ON media(type);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS media_created_idx ON media(created_at);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS media_type_created_idx ON media(type, created_at);`);

  console.log('✅ Migration complete');
}

migrate();
