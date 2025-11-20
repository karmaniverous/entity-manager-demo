import type { MakeOptional } from '@karmaniverous/entity-tools';

import type { EmailItem } from '../../entity-manager/Email';
import { entityClient } from '../../entity-manager/entityClient';
import { readEmail } from './readEmail';

/**
 * `createEmail` params.
 */
export type CreateEmailParams = MakeOptional<EmailItem, 'created'>;

/**
 * Create an email record in the database.
 *
 * @param params - Email record data. Generated properties will be overwritten.
 *
 * @returns Created email record.
 *
 * @throws Error if email record already exists.
 *
 * @category Email
 */
export const createEmail = async (
  params: CreateEmailParams,
): Promise<EmailItem> => {
  const entityToken = 'email';

  // Extract params.
  const { email, userId, ...rest } = params;

  // Normalized params.
  // Normalize email for case-insensitive uniqueness. Store only the
  // normalized value so reads/writes are consistent and search is trivial.
  const normalizedEmail = email.toLowerCase();

  // Throw error if record already exists.
  // Uniqueness is enforced by the entity config (uniqueProperty).
  if ((await readEmail(normalizedEmail)).length)
    throw new Error('Email record already exists.');

  // Create new item.
  const now = Date.now();
  const item: EmailItem = {
    ...rest,
    created: now,
    email: normalizedEmail,
    userId,
  };

  // Generate record from item.
  const record = entityClient.entityManager.addKeys(entityToken, item);

  // Persist the storage-facing record (includes generated/global keys);
  // handlers return the domain item shape for DX.
  // Create record in database.
  await entityClient.putItem(record);

  // Return new item.
  return item;
};
