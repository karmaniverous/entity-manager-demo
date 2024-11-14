import { type MakeUpdatable, updateRecord } from '@karmaniverous/entity-tools';
import { normstr } from '@karmaniverous/string-utilities';

import { entityClient } from '../../entity-manager/entityClient';
import type { User } from '../../entity-manager/User';
import { readUser } from './readUser';

/**
 * Update a user record in the database.
 *
 * @param data - User update data. Only `userId` is required. Generated properties will be overwritten. `null` optional properties will be deleted.
 *
 * @throws Error if user record does not exist.
 *
 * @category User
 */
export const updateUser = async (
  data: MakeUpdatable<User, 'userId'>,
): Promise<User> => {
  const entityToken = 'user';

  // Extract properties.
  const { firstName, lastName, userId, ...rest } = data;

  // Get item from database.
  let item = await readUser(userId);

  // Throw error if item doesn't exist.
  if (!item) throw new Error('User does not exist.');

  // Update item.
  item = updateRecord(item, {
    firstName,
    firstNameCanonical: normstr(firstName),
    lastName,
    lastNameCanonical: normstr(lastName),
    updated: Date.now(),
    ...rest,
  });

  // Generate record from updated item.
  const record = entityClient.entityManager.addKeys(entityToken, item);

  // Update record in database.
  await entityClient.putItem(record);

  // Return updated item.
  return item;
};
