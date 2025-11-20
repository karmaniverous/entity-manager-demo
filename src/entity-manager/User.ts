import { EntityClient } from '@karmaniverous/entity-client-dynamodb';
import type { EntityRecordByToken } from '@karmaniverous/entity-manager';
import { z } from 'zod';

import { entityClient } from '../entity-manager/entityClient';

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
