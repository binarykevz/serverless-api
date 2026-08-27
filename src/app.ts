import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { images } from './routes/images';
import { videos } from './routes/videos';
import { health } from './routes/health';
import { AppError } from './utils/errors';

export const app = new Elysia()
  .use(cors())
  .use(health)
  .use(images)
  .use(videos)
  .onError(({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: { code: error.code, message: error.message }
      };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Endpoint does not exist.' }
      };
    }

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message }
      };
    }

    console.error('Unhandled error:', error);
    set.status = 500;
    return {
      success: false,
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    };
  });
