import type { EmailItem } from '../../entity-manager/Email';
import { entityClient } from '../../entity-manager/entityClient';
import { readEmail } from './readEmail';

// Email is unique by address in this demo; there will be at most one record.
// We read -> derive exact keys -> delete for safety.
/**
 * Delete email records from the database based on unique email.
 *
 * @param email - Email record unique id.
 *
 * @throws Error if email records do not exist.
 *
 * @category Email
 */
export const deleteEmail = async (email: EmailItem['email']): Promise<void> => {
  const entityToken = 'email';

  // Get record from database.
  const items = await readEmail(email, true);

  // Throw error if records don't exist.
  if (!items.length) throw new Error('Email records do not exist.');

  // Get key from record.
  const keys = entityClient.entityManager.getPrimaryKey(entityToken, items);

  // Delete record from database.
  await entityClient.deleteItems(keys);
};
