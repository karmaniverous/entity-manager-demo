import { entityClient } from '../../entity-manager/entityClient';
import type { User } from '../../entity-manager/types';
import { readUser } from './readUser';

/**
 * Delete user records from the database based on unique userId.
 *
 * @param userId - User record unique id.
 *
 * @throws Error if user records do not exist.
 *
 * @category User
 */
export const deleteUser = async (userId: User['userId']): Promise<void> => {
  const entityToken = 'user';

  // Get records from database.
  const items = await readUser(userId, true);

  // Throw error if records don't exist.
  if (!items.length) throw new Error('User records do not exist.');

  // Get key from record.
  const keys = entityClient.entityManager.getPrimaryKey(entityToken, items);

  // Delete record from database.
  await entityClient.deleteItems(keys);
};
