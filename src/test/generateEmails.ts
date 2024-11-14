import { faker } from '@faker-js/faker';

import type { User } from '../entity-manager';
import type { createEmail } from '../handlers';

export interface CreateEmailsConfig {
  maxPerUser?: number;
  minPerUser?: number;
  users: User[];
}

export const generateEmails = (
  config: CreateEmailsConfig,
): Parameters<typeof createEmail>[0][] => {
  const { maxPerUser = 1, minPerUser = 0, users } = config;

  return users
    .filter(({ userId }) => !!userId)
    .map(({ userId, firstName, lastName }) =>
      Array(
        Math.floor(Math.random() * Math.max(maxPerUser - minPerUser, 0)),
      ).map(() => ({
        email: faker.internet.email({ firstName, lastName }),
        userId,
      })),
    )
    .flat();
};
