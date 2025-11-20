import { EntityClient } from '@karmaniverous/entity-client-dynamodb';
import type { EntityRecordByToken } from '@karmaniverous/entity-manager';
import { z } from 'zod';

import { entityClient } from '../entity-manager/entityClient';

/**
 * User domain schema (base fields only).
 *
 * This schema excludes all generated/global keys. Those are derived from this
 * base shape by Entity Manager according to the config. Handlers can rely on
 * domain types for input/output and only materialize keys when interacting
 * with the database.
 */
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

export type UserItem = z.infer<typeof userSchema>;

type CCOfClient = typeof entityClient extends EntityClient<infer C> ? C : never;

export type UserRecord = EntityRecordByToken<CCOfClient, 'user'>;
