import { createQueryBuilder } from '@karmaniverous/entity-client-dynamodb';
import { sort } from '@karmaniverous/entity-tools';
import type { Email } from '../../entity-manager/types';
import { entityClient } from '../../entity-manager/entityClient';

/**
 * Parameters for the {@link searchEmails | `searchEmails`} function.
 *
 * @category Email
 */
export interface SearchEmailsParams {
  /** Unix ms timestamp of earliest `created` value. */
  createdFrom?: Email['created'];

  /** Unix ms timestamp of latest `created` value. */
  createdTo?: Email['created'];

  /** Page key map from previous search page. */
  pageKeyMap?: string;

  /** Sort results in descending order by `created` if `true`. */
  sortDesc?: boolean;

  /** Unique id of related User record. */
  userId?: Email['userId'];
}

/**
 * Search for Email records in the database.
 *
 * @category Email
 */
export const searchEmails = async (params: SearchEmailsParams) => {
  const entityToken = 'email';

  // Extract params.
  const { createdFrom, createdTo, pageKeyMap, sortDesc, userId } = params;

  // Determine hash key token.
  const hashKeyToken = userId ? 'userHashKey' : 'hashKey';

  // Determine index token based on params.
  const indexToken: keyof typeof cf.indexes =
    hashKeyToken === 'userHashKey' ? 'userCreated' : 'created';

  // CF literal for index-token narrowing (optional DX sugar).
  const cf = {
    indexes: {
      created: { hashKey: 'hashKey', rangeKey: 'created' },
      userCreated: { hashKey: 'userHashKey', rangeKey: 'created' },
    },
  } as const;

  // Create an email entity query & query database (ET inferred; ITS from cf).
  const result = await createQueryBuilder({
    entityClient,
    entityToken,
    hashKeyToken,
    pageKeyMap,
    cf,
  })
    .addRangeKeyCondition(indexToken, {
      property: 'created',
      operator: 'between',
      value: { from: createdFrom, to: createdTo },
    })
    .query({
      item: userId ? { userId } : {},
      sortOrder: [{ property: 'created', desc: sortDesc }],
      timestampFrom: createdFrom,
      timestampTo: createdTo,
    });

  // Return empty result if no items found.
  if (!result.items.length) return result;

  // Extract result keys.
  const keys = entityClient.entityManager.getPrimaryKey(
    entityToken,
    result.items,
  );

  // Enrich result items.
  const { items } = await entityClient.getItems(keys);

  // Sort enriched items.
  const sortedItems = sort(items, [
    {
      property: 'created',
      desc: sortDesc,
    },
  ]);

  // Remove keys & re-integrate with result.
  result.items = entityClient.entityManager.removeKeys(
    entityToken,
    sortedItems,
  );

  return result;
};
