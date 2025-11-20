import type { EntityClient } from '@karmaniverous/entity-client-dynamodb';
import type { EntityRecordByToken } from '@karmaniverous/entity-manager';
type CCOfClient = typeof entityClient extends EntityClient<infer C> ? C : never;

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
): Promise<EntityRecordByToken<CCOfClient, 'user'>[]>; // records with keys
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

  // Retrieve records from database with token-aware branching.
  if (keepKeys) {
    const { items } = await entityClient.getItems(entityToken, keys, {
      removeKeys: false,
    });
    return items;
  }
  // Domain path: project only domain fields to avoid keys entirely.
  const attrs = [
    'beneficiaryId',
    'created',
    'firstName',
    'firstNameCanonical',
    'lastName',
    'lastNameCanonical',
    'phone',
    'updated',
    'userId',
  ] as const;
  const { items } = await entityClient.getItems(entityToken, keys, attrs);
  return items;
}
