import { entityClient } from '../../entity-manager/entityClient';
import type { User } from '../../entity-manager/User';

/**
 * Read a user record from the database.
 *
 * @param userId - User record unique id.
 *
 * @returns User record or `undefined` if not found.
 *
 * @category User
 */
export const readUser = async (
  userId: User['userId'],
  keepKeys = false,
): Promise<User | undefined> => {
  const entityToken = 'user';

  // Conform request params & generate request keys.
  const request = entityClient.entityManager.getPrimaryKey(entityToken, {
    userId,
  });

  // Retrieve record from database.
  const { Item: record } = await entityClient.getItem(request);

  // Remove keys from record, type, and return.
  if (record)
    return (
      keepKeys
        ? record
        : entityClient.entityManager.removeKeys(entityToken, record)
    ) as User;
};
