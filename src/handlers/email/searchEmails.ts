import { QueryBuilder } from '@karmaniverous/entity-client-dynamodb';
import { sort } from '@karmaniverous/entity-tools';

import type { Email } from '../../entity-manager/Email';
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
  const indexToken = hashKeyToken === 'userHashKey' ? 'userCreated' : 'created';

  // Create an email entity query & query database.
  const result = await new QueryBuilder({
    entityClient,
    entityToken,
    hashKeyToken,
    pageKeyMap,
  })
    .addRangeKeyCondition(indexToken, {
      property: 'created',
      operator: 'between',
      value: { from: createdFrom, to: createdTo },
    })
    .query({
      item: { userId },
      sortOrder: [{ property: 'created', desc: sortDesc }],
      timestampFrom: createdFrom,
      timestampTo: createdTo,
    });

  // Return empty result if no items found.
  if (!result.items.length) return result;

  // Extract result keys.
  const resultKeys = result.items.map((item) =>
    entityClient.entityManager.getPrimaryKey(entityToken, item),
  );

  // Enrich result.
  const enriched = await entityClient.getItems(resultKeys);

  // Sort, integrate & return enriched results.
  result.items = sort(enriched.items, [
    {
      property: 'created',
      desc: sortDesc,
    },
  ]);

  return result;
};
