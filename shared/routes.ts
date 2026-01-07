import { z } from 'zod';
import { insertEventSchema, insertAttendeeSchema, events, attendees, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    me: {
      method: 'GET' as const,
      path: '/api/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      },
    },
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events',
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect & { attendeeCount: number }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/events/:id',
      responses: {
        200: z.custom<typeof events.$inferSelect & { attendees: typeof attendees.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events',
      input: insertEventSchema.omit({ isPublished: true, createdById: true }),
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    publish: {
      method: 'PATCH' as const,
      path: '/api/events/:id/publish',
      input: z.object({ isPublished: z.boolean() }),
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  attendees: {
    create: {
      method: 'POST' as const,
      path: '/api/events/:eventId/attendees',
      input: insertAttendeeSchema.omit({ eventId: true, userId: true }),
      responses: {
        201: z.custom<typeof attendees.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/attendees/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
