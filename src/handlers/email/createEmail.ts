import { MakeOptional } from '@karmaniverous/entity-tools';

import { entityClient } from '../../entityClient';
import { Email, entityManager } from '../../entityManager';
import { readEmail } from './readEmail';

/**
 * Create an email record in the database.
 *
 * @param record - Email record to create. `created` is optional and will be set to the current time if not provided.
 *
 * @returns Created email record.
 *
 * @throws Error if email record already exists.
 */
export const createEmail = async (
  record: MakeOptional<Email, 'created'>,
): Promise<Email> => {
  // Extract record properties.
  const { created, email, userId } = record;

  // Throw error if record already exists.
  if (await readEmail(email)) throw new Error('Email record already exists.');

  // Conform request params & generate request keys.
  const request = entityManager.addKeys('email', {
    created: created ?? Date.now(),
    email: email.toLowerCase(),
    userId,
  }) as Email;

  // Create record in database.
  await entityClient.putItem('email', request);

  // Return created record.
  return request;
};
