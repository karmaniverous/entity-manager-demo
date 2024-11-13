import { entityClient } from '../../entity-manager/entityClient';
import type { User } from '../../entity-manager/User';
import { readUser } from './readUser';

/**
 * Delete a user record from the database.
 *
 * @param userId - User record unique id.
 *
 * @throws Error if user record does not exist.
 *
 * @category User
 */
export const deleteUser = async (userId: User['userId']): Promise<void> => {
  const entityToken = 'user';

  // Get record from database.
  const record = await readUser(userId, true);

  // Throw error if record doesn't exist.
  if (!record) throw new Error('User record does not exist.');

  // Generate request.
  const request = entityClient.entityManager.getPrimaryKey(entityToken, record);

  // Delete record from database.
  await entityClient.deleteItem(request);
};
