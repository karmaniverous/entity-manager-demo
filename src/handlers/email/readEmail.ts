import type { EntityClient } from '@karmaniverous/entity-client-dynamodb';
import type { EntityRecordByToken } from '@karmaniverous/entity-manager';
type CCOfClient = typeof entityClient extends EntityClient<infer C> ? C : never;

import { entityClient } from '../../entity-manager/entityClient';
import type { Email } from '../../entity-manager/types';

/**
 * Read email records from the database based on unique email.
 *
 * @param email - Email record unique id.
 *
 * @returns Email record array, empty if not found.
 *
 * @category Email
 */
export function readEmail(
  email: Email['email'],
  keepKeys: true,
): Promise<EntityRecordByToken<CCOfClient, 'email'>[]>; // records with keys
export function readEmail(
  email: Email['email'],
  keepKeys?: false,
): Promise<Email[]>; // domain items (keys removed)
export async function readEmail(email: Email['email'], keepKeys = false) {
  const entityToken = 'email' as const;

  // Generate record keys.
  const keys = entityClient.entityManager.getPrimaryKey(entityToken, {
    email: email.toLowerCase(),
  });

  // Retrieve records from database with token-aware branching.
  if (keepKeys) {
    const { items } = await entityClient.getItems(entityToken, keys, {
      removeKeys: false,
    });
    return items;
  }
  // Domain path: project only domain fields to avoid keys entirely.
  const attrs = ['created', 'email', 'userId'] as const;
  const { items } = await entityClient.getItems(entityToken, keys, attrs);
  return items;
}
