import { entityClient } from '../../entity-manager/entityClient';
import type { User } from '../../entity-manager/types';

/**
 * Read user records from the database based on unique userId.
 *
 * @param userId - User record unique id.
 *
 * @returns User record array, empty if not found.
 *
 * @category User
 */
export const readUser = async (
  userId: User['userId'],
  keepKeys = false,
): Promise<User[]> => {
  const entityToken = 'user';

  // Generate record keys.
  const keys = entityClient.entityManager.getPrimaryKey(entityToken, {
    userId,
  });

  // Retrieve records from database.
  const { items } = await entityClient.getItems(keys);

  // Optionally remove keys from records & return.
  return (
    keepKeys ? items : entityClient.entityManager.removeKeys(entityToken, items)
  ) as User[];
};
