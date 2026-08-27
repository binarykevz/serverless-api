import { app } from './app';
import type { Env } from './config/env';
import { validateEnv } from './config/env';
import { ensureDatabaseSchema } from './db/init';
export default app;

let schemaInitialized = false;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      validateEnv(env);
    } catch (err: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'CONFIG_ERROR', message: err.message }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize schema on first request (lazy init)
    if (!schemaInitialized) {
      try {
        await ensureDatabaseSchema(env);
        schemaInitialized = true;
        console.log('✅ Database schema verified');
      } catch (err) {
        console.error('❌ Schema init failed:', err);
      }
    }

    // @ts-ignore - Elysia handles this
    return app.fetch(request, env, ctx);
  }
};
