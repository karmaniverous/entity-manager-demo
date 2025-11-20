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
 *
 * keepKeys=true → returns records (with keys); keepKeys omitted/false →
 * returns domain items (generated/global keys removed).
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

  const { items } = await entityClient.getItems(entityToken, keys);

  if (keepKeys) return items;

  // For API responses, return domain items without generated/global keys.
  return entityClient.entityManager.removeKeys(entityToken, items);
}
