import { ShardQueryMapBuilder } from '@karmaniverous/entity-client-dynamodb';
import type { SortOrder } from '@karmaniverous/entity-tools';

import { entityClient } from '../../entityClient';
import { type Email, type EmailItem, entityManager } from '../../entityManager';

export interface SearchEmailsParams {
  createdFrom?: number;
  createdTo?: number;
  sort: SortOrder<Pick<Email, 'created'>>;
  userId?: string;
}

export const searchEmails = async (params: SearchEmailsParams) => {
  // Extract params.
  const { createdFrom, createdTo, sort, userId } = params;

  // Determine hash key token based on params.
  const hashKeyToken = userId ? 'userHashKey' : 'hashKey';

  // Determine index token based on params.
  const indexToken = hashKeyToken === 'userHashKey' ? 'userCreated' : 'created';

  const shardQueryMap = new ShardQueryMapBuilder<EmailItem>({
    doc: entityClient.doc,
    logger: entityClient.logger,
    hashKeyToken,
    tableName: 'user',
  })
    .addRangeKeyCondition(indexToken, {
      property: 'created',
      operator: 'between',
      value: { from: createdFrom, to: createdTo },
    })
    .build();

  return await entityManager.query({
    entityToken: 'email',
    hashKey: entityManager.addKeys('email', { userId })[hashKeyToken]!,
    shardQueryMap,
    sortOrder: sort,
    timestampFrom: createdFrom,
    timestampTo: createdTo,
  });
};
