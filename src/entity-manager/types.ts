/** src/entity-manager/types.ts */
import { z } from 'zod';

import { emailSchema, userSchema } from './schemas';

export type Email = z.infer<typeof emailSchema>;

export type User = z.infer<typeof userSchema>;

export type { Email as EmailItem, User as UserItem };
