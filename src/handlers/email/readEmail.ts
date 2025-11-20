import type { EntityRecordByToken } from '@karmaniverous/entity-manager';

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
): Promise<
  EntityRecordByToken<
    Parameters<(typeof entityClient)['entityManager']['addKeys']>[0],
    'email'
  >[]
>; // records with keys
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
