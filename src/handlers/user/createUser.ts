import type { MakeOptional } from '@karmaniverous/entity-tools';
import { normstr } from '@karmaniverous/string-utilities';
import { nanoid } from 'nanoid';

import { entityClient } from '../../entity-manager/entityClient';
import type { User } from '../../entity-manager/User';

/**
 * Create an user record in the database.
 *
 * @param data - User record data. Generated properties will be overwritten.
 *
 * @returns Created user record.
 *
 * @throws Error if user record already exists.
 *
 * @category User
 */
export const createUser = async (
  data: MakeOptional<
    User,
    | 'created'
    | 'firstNameCanonical'
    | 'lastNameCanonical'
    | 'updated'
    | 'userId'
  >,
): Promise<User> => {
  const entityToken = 'user';

  // Extract data properties.
  const { firstName, lastName, ...rest } = data;

  // Create new item.
  const now = Date.now();
  const item: User = {
    ...rest,
    created: now,
    firstName,
    firstNameCanonical: normstr(firstName)!,
    lastName,
    lastNameCanonical: normstr(lastName)!,
    updated: now,
    userId: nanoid(),
  };

  // Generate record from item.
  const record = entityClient.entityManager.addKeys(entityToken, item);

  // Create record in database.
  await entityClient.putItem(record);

  // Return new item.
  return item;
};
