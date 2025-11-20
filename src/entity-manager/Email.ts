import { EntityClient } from '@karmaniverous/entity-client-dynamodb';
import type { EntityRecordByToken } from '@karmaniverous/entity-manager';
import { z } from 'zod';

import { entityClient } from '../entity-manager/entityClient';

export const emailSchema = z.object({
  created: z.number(),
  email: z.string(),
  userId: z.string(),
});

export type EmailItem = z.infer<typeof emailSchema>;

type CCOfClient = typeof entityClient extends EntityClient<infer C> ? C : never;

export type EmailRecord = EntityRecordByToken<CCOfClient, 'email'>;
