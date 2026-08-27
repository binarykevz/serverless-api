import type { Env } from '../config/env';

export async function uploadToR2(
  env: Env,
  key: string,
  body: ArrayBuffer | ReadableStream,
  contentType: string
): Promise<void> {
  await env.R2.put(key, body, {
    httpMetadata: { contentType },
  });
}

export async function deleteFromR2(env: Env, key: string): Promise<void> {
  await env.R2.delete(key);
}

export async function headFromR2(env: Env, key: string): Promise<R2Object | null> {
  return env.R2.head(key);
}
