import { QueryBuilder } from '@karmaniverous/entity-client-dynamodb';
import { normstr } from '@karmaniverous/string-utilities';

import { entityClient } from '../../entityClient';
import { type User } from '../../entityManager';

export interface SearchUsersParams {
  beneficiaryId?: User['beneficiaryId'];
  createdFrom?: User['created'];
  createdTo?: User['created'];
  name?: string;
  pageKeyMap?: string;
  phone?: User['phone'];
  sortDesc?: boolean;
  sortOrder?: 'created' | 'name' | 'updated';
  updatedFrom?: User['updated'];
  updatedTo?: User['updated'];
}

export const searchUsers = async (params: SearchUsersParams) => {
  const entityToken = 'user';

  // Extract params.
  const {
    beneficiaryId,
    createdFrom,
    createdTo,
    pageKeyMap,
    sortDesc,
    updatedFrom,
    updatedTo,
  } = params;

  const name = normstr(params.name);
  const phone = normstr(params.phone);

  // Default sort order.
  const sortOrder: NonNullable<typeof params.sortOrder> =
    params.sortOrder ??
    (name ? 'name' : updatedFrom || updatedTo ? 'updated' : 'created');

  // Determine hash key token.
  const hashKeyToken = beneficiaryId ? 'beneficiaryHashKey' : 'hashKey';

  // Determine range key tokens.
  const rangeKeyTokens = phone
    ? ['phone']
    : sortOrder === 'created'
      ? ['created']
      : sortOrder === 'name'
        ? name
          ? ['firstNameRangeKey', 'lastNameRangeKey']
          : ['lastNameRangeKey']
        : ['updated'];

  // Determine index tokens.
  const indexTokens = rangeKeyTokens.map(
    (rangeKeyToken) =>
      entityClient.entityManager.findIndexToken(hashKeyToken, rangeKeyToken)!,
  );

  // Create a query builder.
  let queryBuilder = new QueryBuilder({
    entityClient,
    entityToken,
    hashKeyToken,
    pageKeyMap,
  });

  // Iterate over index tokens.
  for (let i = 0; i < indexTokens.length; i++) {
    // Add a range key condition.
    if (rangeKeyTokens[i] === 'created')
      queryBuilder = queryBuilder.addRangeKeyCondition(indexTokens[i], {
        property: 'created',
        operator: 'between',
        value: { from: createdFrom, to: createdTo },
      });
    else if (rangeKeyTokens[i] === 'firstNameRangeKey')
      queryBuilder = queryBuilder.addRangeKeyCondition(indexTokens[i], {
        property: 'firstNameRangeKey',
        operator: 'begins_with',
        value: entityClient.entityManager.encodeGeneratedProperty(
          'firstNameRangeKey',
          { firstNameCanonical: name },
        ),
      });
    else if (rangeKeyTokens[i] === 'lastNameRangeKey')
      queryBuilder = queryBuilder.addRangeKeyCondition(indexTokens[i], {
        property: 'lastNameRangeKey',
        operator: 'begins_with',
        value: entityClient.entityManager.encodeGeneratedProperty(
          'lastNameRangeKey',
          { lastNameCanonical: name },
        ),
      });
    else if (rangeKeyTokens[i] === 'phone')
      queryBuilder = queryBuilder.addRangeKeyCondition(indexTokens[i], {
        property: 'phone',
        operator: 'begins_with',
        value: phone,
      });
    else if (rangeKeyTokens[i] === 'updated')
      queryBuilder = queryBuilder.addRangeKeyCondition(indexTokens[i], {
        property: 'updated',
        operator: 'between',
        value: { from: updatedFrom, to: updatedTo },
      });
    else throw new Error(`Unsupported range key token '${rangeKeyTokens[i]}'.`);

    // Add created filter condition if not covered by range key condition.
    if ((createdFrom || createdTo) && rangeKeyTokens[i] !== 'created')
      queryBuilder = queryBuilder.addFilterCondition(indexTokens[i], {
        property: 'created',
        operator: 'between',
        value: { from: createdFrom, to: createdTo },
      });

    // Add name filter condition if not covered by range key condition.
    if (
      name &&
      !['firstNameRangeKey', 'lastNameRangeKey'].includes(rangeKeyTokens[i])
    )
      queryBuilder = queryBuilder.addFilterCondition(indexTokens[i], {
        operator: 'or',
        conditions: [
          {
            property: 'firstNameCanonical',
            operator: 'begins_with',
            value: name,
          },
          {
            property: 'lastNameCanonical',
            operator: 'begins_with',
            value: name,
          },
        ],
      });

    // If phone exists it is always covered by range key condition.

    // Add updated filter condition if not covered by range key condition.
    if ((updatedFrom || updatedTo) && rangeKeyTokens[i] !== 'updated')
      queryBuilder = queryBuilder.addFilterCondition(indexTokens[i], {
        property: 'updated',
        operator: 'between',
        value: { from: updatedFrom, to: updatedTo },
      });
  }

  return await queryBuilder.query({
    item: { beneficiaryId },
    sortOrder: [
      {
        property: sortOrder === 'name' ? 'lastNameRangeKey' : sortOrder,
        desc: sortDesc,
      },
    ],
    timestampFrom: createdFrom,
    timestampTo: createdTo,
  });
};
