import type { Email } from '../../entity-manager/Email';
import { entityClient } from '../../entity-manager/entityClient';

/**
 * Read an email record from the database.
 *
 * @param email - Email record unique id.
 *
 * @returns Email record or `undefined` if not found.
 *
 * @category Email
 */
export const readEmail = async (
  email: Email['email'],
  keepKeys = false,
): Promise<Email | undefined> => {
  const entityToken = 'email';

  // Generate record key.
  const key = entityClient.entityManager.getPrimaryKey(entityToken, {
    email: email.toLowerCase(),
  });

  // Retrieve record from database.
  const { Item: record } = await entityClient.getItem(key);

  // Optionally extract item from record & return.
  if (record)
    return (
      keepKeys
        ? record
        : entityClient.entityManager.removeKeys(entityToken, record)
    ) as Email;
};
