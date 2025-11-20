import { entityClient } from '../../entity-manager/entityClient';
import type { UserItem, UserRecord } from '../../entity-manager/User';

/**
 * Read user records from the database based on unique userId.
 *
 * @param userId - User record unique id.
 *
 * @returns User record array, empty if not found.
 *
 * @category User
 */
export function readUser(
  userId: UserItem['userId'],
  keepKeys: true,
): Promise<UserRecord[]>; // records with keys
export function readUser(
  userId: UserItem['userId'],
  keepKeys?: false,
): Promise<UserItem[]>; // domain items (keys removed)
export async function readUser(userId: UserItem['userId'], keepKeys = false) {
  const entityToken = 'user' as const;

  const keys = entityClient.entityManager.getPrimaryKey(entityToken, {
    userId,
  });

  if (keepKeys) {
    const { items } = await entityClient.getItems(entityToken, keys);
    return items;
  }

  const { items } = await entityClient.getItems(entityToken, keys, {
    removeKeys: true,
  });
  return items;
}
