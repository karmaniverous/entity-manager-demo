import type { Email } from '../../entity-manager/types';
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
export const readEmail = async (
  email: Email['email'],
  keepKeys = false,
): Promise<Email[]> => {
  const entityToken = 'email';

  // Generate record keys.
  const keys = entityClient.entityManager.getPrimaryKey(entityToken, {
    email: email.toLowerCase(),
  });

  // Retrieve records from database.
  const { items } = await entityClient.getItems(keys);

  // Optionally remove keys from records & return.
  return (
    keepKeys ? items : entityClient.entityManager.removeKeys(entityToken, items)
  ) as Email[];
};
