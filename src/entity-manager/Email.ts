import type { EntityClientRecordByToken } from '@karmaniverous/entity-manager';
import { z } from 'zod';

import { entityClient } from '../entity-manager/entityClient';

/**
 * Email domain schema (base fields only).
 *
 * Generated/global keys are layered by Entity Manager at runtime. The inferred
 * EmailItem type represents the domain shape used by handlers. When you read
 * through the adapter, records will include generated/global keys; strip them
 * via entityManager.removeKeys('email', record) when you want pure domain
 * objects for API responses.
 */
export const emailSchema = z.object({
  created: z.number(),
  email: z.string(),
  userId: z.string(),
});

export type EmailItem = z.infer<typeof emailSchema>;

export type EmailRecord = EntityClientRecordByToken<
  typeof entityClient,
  'email'
>;
