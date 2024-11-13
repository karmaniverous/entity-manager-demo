import type { MakeOptional } from '@karmaniverous/entity-tools';

import { entityClient } from '../../entityClient';
import type { Email } from '../../entityManager';
import { readEmail } from './readEmail';

/**
 * Create an email record in the database.
 *
 * @param params - Ungenerated email record data.
 *
 * @returns Created email record.
 *
 * @throws Error if email record already exists.
 */
export const createEmail = async (
  params: MakeOptional<Email, 'created'>,
): Promise<Email> => {
  const entityToken = 'email';

  // Extract data properties.
  const { email, userId, ...rest } = params;

  // Throw error if record already exists.
  if (await readEmail(email)) throw new Error('Email record already exists.');

  // Create email record.
  const record: Email = {
    ...rest,
    created: Date.now(),
    email: email.toLowerCase(),
    userId,
  };

  // Generate request.
  const request = entityClient.entityManager.addKeys(entityToken, record);

  // Create record in database.
  await entityClient.putItem(request);

  // Return created record.
  return record;
};
