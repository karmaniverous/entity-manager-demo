import { entityClient } from '../../entityClient';
import { Email, entityManager } from '../../entityManager';
import { readEmail } from './readEmail';

/**
 * Delete an email record from the database.
 *
 * @param email - Unique id of the email record to delete.
 *
 * @throws Error if email record does not exist.
 */
export const deleteEmail = async (email: Email['email']): Promise<void> => {
  // Throw error if record already exists.
  if (!(await readEmail(email)))
    throw new Error('Email record does not exist.');

  // Conform request params & generate request keys.
  const request = entityManager.addKeys('email', {
    email: email.toLowerCase(),
  });

  // Delete record from database.
  await entityClient.deleteItem('user', request);
};
