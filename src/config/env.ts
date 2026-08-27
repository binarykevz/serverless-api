export interface Env {
  // Secrets
  DATABASE_URL: string;
  DATABASE_AUTH_TOKEN: string;
  ADMIN_API_KEY: string;

  // Vars
  R2_PUBLIC_URL: string;
  MAX_IMAGE_SIZE: string;
  MAX_VIDEO_SIZE: string;

  // R2 binding (from wrangler.toml)
  R2: R2Bucket;
}

export function validateEnv(env: Env): void {
  const required = [
    'DATABASE_URL',
    'DATABASE_AUTH_TOKEN',
    'ADMIN_API_KEY',
    'R2_PUBLIC_URL'
  ];

  for (const key of required) {
    if (!(env as any)[key]) {
      throw new Error(`Missing required env: ${key}`);
    }
  }

  if (!env.R2) {
    throw new Error('R2 bucket binding not configured');
  }

  if (!env.DATABASE_URL.startsWith('libsql://')) {
    throw new Error('DATABASE_URL must be a Turso libsql:// URL');
  }
}
