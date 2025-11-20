import { type MakeUpdatable, updateRecord } from '@karmaniverous/entity-tools';
import { normstr } from '@karmaniverous/string-utilities';

import { entityClient } from '../../entity-manager/entityClient';
import type { User } from '../../entity-manager/types';
import { readUser } from './readUser';

/**
 * Update user records in the database based on unique userId.
 *
 * @param data - User update data. Only `userId` is required. Generated properties will be overwritten. `null` optional properties will be deleted.
 *
 * @throws Error if user records do not exist.
 *
 * @category User
 */
export const updateUser = async (
  data: MakeUpdatable<User, 'userId'>,
): Promise<User[]> => {
  const entityToken = 'user';

  // Extract properties.
  const { firstName, lastName, userId, ...rest } = data;

  // Get records from database.
  const items = await readUser(userId);

  // Throw error if records don't exist.
  if (!items.length) throw new Error('User records do not exist.');

  // Update items.
  const updatedItems = items.map((item) =>
    updateRecord(item, {
      firstName,
      firstNameCanonical: normstr(firstName),
      lastName,
      lastNameCanonical: normstr(lastName),
      updated: Date.now(),
      ...rest,
    }),
  );

  // Add keys to updated items.
  const updatedRecords = entityClient.entityManager.addKeys(
    entityToken,
    updatedItems,
  );

  // Update record in database.
  await entityClient.putItems(updatedRecords);

  // Return updated item.
  return updatedItems;
};
