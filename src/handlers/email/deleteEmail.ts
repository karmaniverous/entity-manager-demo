import { entityClient } from '../../entityClient';
import { Email, entityManager } from '../../entityManager';
import { readEmail } from './readEmail';

/**
 * Delete an email record from the database.
 *
 * @param email - Email record unique id.
 *
 * @throws Error if email record does not exist.
 */
export const deleteEmail = async (email: Email['email']): Promise<void> => {
  const entityToken = 'email';

  // Get record from database.
  const record = await readEmail(email, true);

  // Throw error if record doesn't exist.
  if (!record) throw new Error('Email record does not exist.');

  // Generate request.
  const request = entityManager.getPrimaryKey(entityToken, record);

  // Delete record from database.
  await entityClient.deleteItem(request);
};
