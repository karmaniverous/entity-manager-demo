import type { EntityRecordByToken } from '@karmaniverous/entity-manager';

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
export function readUser(
  userId: User['userId'],
  keepKeys: true,
): Promise<
  EntityRecordByToken<
    Parameters<(typeof entityClient)['entityManager']['addKeys']>[0],
    'user'
  >[]
>; // records with keys
export function readUser(
  userId: User['userId'],
  keepKeys?: false,
): Promise<User[]>; // domain items (keys removed)
export async function readUser(userId: User['userId'], keepKeys = false) {
  const entityToken = 'user' as const;

  // Generate record keys.
  const keys = entityClient.entityManager.getPrimaryKey(entityToken, {
    userId,
  });

  // Retrieve records from database with token-aware, literal removeKeys.
  if (keepKeys) {
    const { items } = await entityClient.getItems(entityToken, keys, {
      removeKeys: false,
    });
    return items;
  }
  const { items } = await entityClient.getItems(entityToken, keys, {
    removeKeys: true,
  });
  return items;
}
