import { QueryBuilder } from '@karmaniverous/entity-client-dynamodb';
import type { SortOrder } from '@karmaniverous/entity-tools';

import { entityClient } from '../../entityClient';
import { type Email } from '../../entityManager';

export interface SearchEmailsParams {
  createdFrom?: Email['created'];
  createdTo?: Email['created'];
  pageKeyMap?: string;
  sort: SortOrder<Pick<Email, 'created'>>;
  userId?: Email['userId'];
}

export const searchEmails = async (params: SearchEmailsParams) => {
  const entityToken = 'email';

  // Extract params.
  const { createdFrom, createdTo, pageKeyMap, sort, userId } = params;

  // Determine hash key token based on params.
  const hashKeyToken = userId ? 'userHashKey' : 'hashKey';

  // Determine index token based on params.
  const indexToken = hashKeyToken === 'userHashKey' ? 'userCreated' : 'created';

  // Create an email entity query.
  return await new QueryBuilder({
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
      sortOrder: sort,
      timestampFrom: createdFrom,
      timestampTo: createdTo,
    });
};
