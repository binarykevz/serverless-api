export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (msg: string) => new AppError(400, 'BAD_REQUEST', msg);
export const unauthorized = (msg: string) => new AppError(401, 'UNAUTHORIZED', msg);
export const forbidden = (msg: string) => new AppError(403, 'FORBIDDEN', msg);
export const notFound = (msg: string) => new AppError(404, 'NOT_FOUND', msg);
export const tooLarge = (msg: string) => new AppError(413, 'FILE_TOO_LARGE', msg);
export const unsupportedMediaType = (msg: string) => new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', msg);
export const internalError = (msg: string) => new AppError(500, 'INTERNAL_SERVER_ERROR', msg);
