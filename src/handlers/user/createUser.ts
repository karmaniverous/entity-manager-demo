import type { MakeOptional } from '@karmaniverous/entity-tools';
import { normstr } from '@karmaniverous/string-utilities';
import { nanoid } from 'nanoid';

import { entityClient } from '../../entity-manager/entityClient';
import type { User } from '../../entity-manager/User';

/**
 * Create an user record in the database.
 *
 * @param params - Ungenerated user record data.
 *
 * @returns Created user record.
 *
 * @throws Error if user record already exists.
 *
 * @category User
 */
export const createUser = async (
  params: MakeOptional<
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
  const { firstName, lastName, ...rest } = params;

  // Create user record.
  const now = Date.now();
  const record: User = {
    ...rest,
    created: now,
    firstName,
    firstNameCanonical: normstr(firstName)!,
    lastName,
    lastNameCanonical: normstr(lastName)!,
    updated: now,
    userId: nanoid(),
  };

  // Generate request.
  const request = entityClient.entityManager.addKeys(entityToken, record);

  // Create record in database.
  await entityClient.putItem(request);

  // Return created record.
  return record;
};
