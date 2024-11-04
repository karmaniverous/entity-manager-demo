import { entityClient } from '../../entityClient';
import { type Email, EmailItem, entityManager } from '../../entityManager';

/**
 * Read an email record from the database by unique id `email`.
 *
 * @param email - Unique id of the email record to read.
 *
 * @returns Email record or `undefined` if not found.
 */
export const readEmail = async (
  email: Email['email'],
): Promise<Email | undefined> => {
  // Conform request params & generate request keys.
  const request = entityManager.addKeys('email', {
    email: email.toLowerCase(),
  });

  // Retrieve record from database.
  const { Item: record } = await entityClient.getItem('user', request);

  // Remove keys from record, type, and return.
  if (record)
    return entityManager.removeKeys('email', record as EmailItem) as Email;
};
