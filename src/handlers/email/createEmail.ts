import type { MakeOptional } from '@karmaniverous/entity-tools';

import type { Email } from '../../entity-manager/Email';
import { entityClient } from '../../entity-manager/entityClient';
import { readEmail } from './readEmail';

/**
 * Create an email record in the database.
 *
 * @param data - Email record data. Generated properties will be overwritten.
 *
 * @returns Created email record.
 *
 * @throws Error if email record already exists.
 *
 * @category Email
 */
export const createEmail = async (
  data: MakeOptional<Email, 'created'>,
): Promise<Email> => {
  const entityToken = 'email';

  // Extract data properties.
  const { email, userId, ...rest } = data;

  // Throw error if record already exists.
  if (await readEmail(email)) throw new Error('Email record already exists.');

  // Create new item.
  const item: Email = {
    ...rest,
    created: Date.now(),
    email: email.toLowerCase(),
    userId,
  };

  // Generate record from item.
  const record = entityClient.entityManager.addKeys(entityToken, item);

  // Create record in database.
  await entityClient.putItem(record);

  // Return new item.
  return item;
};
