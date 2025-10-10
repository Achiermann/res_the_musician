/**
 * Validation schemas using Zod
 * Adjust fields per resource as needed
 */

import { z } from 'zod';

/**
 * Schema for creating a gig/concert
 * Only act and date are mandatory
 */
export const CreateGigPayload = z.object({
  act: z.string().min(1, 'Act is required').max(200, 'Act name too long'),
  date: z.string().min(1, 'Date is required'),
  venue: z.string().max(200, 'Venue name too long').optional().default(''),
  location: z.string().max(200, 'Location too long').optional().default(''),
  comments: z.string().optional().default(''),
  status: z.enum(['offen', 'fix']).optional().default('offen'),
});

/**
 * Schema for updating a gig/concert (all fields optional)
 */
export const UpdateGigPayload = CreateGigPayload.partial();

/**
 * Schema for creating an event (legacy - kept for compatibility)
 */
export const CreateEventPayload = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
  participants: z.number().int().min(0).optional(),
});

/**
 * Schema for updating an event (all fields optional)
 */
export const UpdateEventPayload = CreateEventPayload.partial();

/**
 * Generic schemas for other resources
 */
export const CreatePayload = z.object({
  field_a: z.string().min(1),
  field_b: z.string().optional(),
  // add your minimal contract; keep it tight
});

export const UpdatePayload = CreatePayload.partial();
