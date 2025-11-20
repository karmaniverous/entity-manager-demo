/** src/entity-manager/schemas.ts */
import { z } from 'zod';

export const emailSchema = z.object({
  created: z.number(),
  email: z.string(),
  userId: z.string(),
});

export const userSchema = z.object({
  beneficiaryId: z.string(),
  created: z.number(),
  firstName: z.string(),
  firstNameCanonical: z.string(),
  lastName: z.string(),
  lastNameCanonical: z.string(),
  phone: z.string().optional(),
  updated: z.number(),
  userId: z.string(),
});

export const schemas = {
  email: emailSchema,
  user: userSchema,
} as const;
