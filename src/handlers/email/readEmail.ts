import type { EmailItem, EmailRecord } from '../../entity-manager/Email';
import { entityClient } from '../../entity-manager/entityClient';

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
  email: EmailItem['email'],
  keepKeys: true,
): Promise<EmailRecord[]>; // records with keys
export function readEmail(
  email: EmailItem['email'],
  keepKeys?: false,
): Promise<EmailItem[]>; // domain items (keys removed)
export async function readEmail(email: EmailItem['email'], keepKeys = false) {
  const entityToken = 'email' as const;

  const keys = entityClient.entityManager.getPrimaryKey(entityToken, {
    email: email.toLowerCase(),
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
