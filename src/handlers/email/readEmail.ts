import { entityClient } from '../../entityClient';
import { type Email } from '../../entityManager';

/**
 * Read an email record from the database.
 *
 * @param email - Email record unique id.
 *
 * @returns Email record or `undefined` if not found.
 */
export const readEmail = async (
  email: Email['email'],
  keepKeys = false,
): Promise<Email | undefined> => {
  const entityToken = 'email';

  // Conform request params & generate request keys.
  const request = entityClient.entityManager.getPrimaryKey(entityToken, {
    email: email.toLowerCase(),
  });

  // Retrieve record from database.
  const { Item: record } = await entityClient.getItem(request);

  // Remove keys from record, type, and return.
  if (record)
    return (
      keepKeys
        ? record
        : entityClient.entityManager.removeKeys(entityToken, record)
    ) as Email;
};
