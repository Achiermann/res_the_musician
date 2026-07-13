/**
 * Validation schemas using Zod
 * Adjust fields per resource as needed
 */

import { z } from 'zod';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/**
 * `start` and `end` are Postgres `time` columns, which reject ''. A blank input
 * is stored as NULL.
 */
const time = z
  .union([
    z.literal(''),
    z.null(),
    z.string().regex(TIME_RE, 'Time must be HH:MM or HH:MM:SS'),
  ])
  .transform((v) => (v === '' ? null : v));

/**
 * Field rules shared by create and update, without any .default(). Defaults are
 * applied only on create: on update they would resurrect as values for fields
 * the client never sent, overwriting stored data with '' (see UpdateGigPayload).
 */
const gig = {
  act: z.string().min(1, 'Act is required').max(200, 'Act name too long'),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().max(200, 'Venue name too long'),
  location: z.string().max(200, 'Location too long'),
  comments: z.string(),
  status: z.enum(['offen', 'fix']),
  start: time,
  end: time,
  url: z.string(),
};

/**
 * Schema for creating a gig/concert
 * Only act and date are mandatory
 */
export const CreateGigPayload = z.object({
  act: gig.act,
  date: gig.date,
  venue: gig.venue.optional().default(''),
  location: gig.location.optional().default(''),
  comments: gig.comments.optional().default(''),
  status: gig.status.optional().default('offen'),
  start: gig.start.optional(),
  end: gig.end.optional(),
  url: gig.url.optional().default(''),
});

/**
 * Schema for updating a gig/concert. Every field is optional and carries no
 * default, so a field the client omits is absent from the parsed output and is
 * left untouched in the DB. Built explicitly rather than via
 * CreateGigPayload.partial(), which keeps the create defaults and would blank
 * out unsent columns on a partial PATCH.
 */
export const UpdateGigPayload = z.object({
  act: gig.act.optional(),
  date: gig.date.optional(),
  venue: gig.venue.optional(),
  location: gig.location.optional(),
  comments: gig.comments.optional(),
  status: gig.status.optional(),
  start: gig.start.optional(),
  end: gig.end.optional(),
  url: gig.url.optional(),
});
