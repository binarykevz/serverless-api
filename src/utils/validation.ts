import { t } from 'elysia';

export const paginationQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 }))
});

export const randomQuery = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50, default: 5 }))
});
