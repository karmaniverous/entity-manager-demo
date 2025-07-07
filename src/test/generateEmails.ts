import { faker } from '@faker-js/faker';

import type { User } from '../entity-manager';
import type { CreateEmailParams } from '../handlers';

/**
 * {@link generateEmails | `generateEmails`} config object.
 */
export interface GenerateEmailsConfig {
  /** Maximum number of emails to generate per User. Default: `1` */
  maxPerUser?: number;

  /** Minimum number of emails to generate per User. Default: `0` */
  minPerUser?: number;

  /** Array of {@link User | `User`} objects to create Emails for. */
  users: User[];
}

/**
 * Generates an array of {@link CreateEmailParams | `CreateEmailParams`} objects.
 *
 * @param config - {@link GenerateEmailsConfig | `GenerateEmailsConfig`} object.
 *
 * @returns Array of {@link CreateEmailParams | `CreateEmailParams`} objects.
 */
export const generateEmails = (
  config: GenerateEmailsConfig,
): CreateEmailParams[] => {
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
