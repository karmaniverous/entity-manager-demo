import { QueryBuilder } from '@karmaniverous/entity-client-dynamodb';
import type { SortOrder } from '@karmaniverous/entity-tools';

import { entityClient } from '../../entityClient';
import { type Email, entityManager } from '../../entityManager';

export interface SearchEmailsParams {
  createdFrom?: number;
  createdTo?: number;
  pageKeyMap?: string;
  sort: SortOrder<Pick<Email, 'created'>>;
  userId?: string;
}

export const searchEmails = async (params: SearchEmailsParams) => {
  // Extract params.
  const { createdFrom, createdTo, pageKeyMap, sort, userId } = params;

  // Determine hash key token based on params.
  const hashKeyToken = userId ? 'userHashKey' : 'hashKey';

  // Determine index token based on params.
  const indexToken = hashKeyToken === 'userHashKey' ? 'userCreated' : 'created';

  // Create an email entity query.
  return await new QueryBuilder({
    tableName: 'UserService',
    entityClient,
    entityManager,
    entityToken: 'email',
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
