import { QueryBuilder } from '@karmaniverous/entity-client-dynamodb';
import { sort } from '@karmaniverous/entity-tools';
import { normstr } from '@karmaniverous/string-utilities';

import { entityClient } from '../../entity-manager/entityClient';
import { User } from '../../entity-manager/User';

/**
 * Parameters for the {@link searchUsers | `searchUsers`} function.
 *
 * @category User
 */
export interface SearchUsersParams {
  /** Unique id of related Beneficiary record. */
  beneficiaryId?: User['beneficiaryId'];

  /** Unix ms timestamp of earliest `created` value. */
  createdFrom?: User['created'];

  /** Unix ms timestamp of latest `created` value. */
  createdTo?: User['created'];

  /** First characters of either first or last name. Case, whitespace & diacritic insensitive. */
  name?: string;

  /** Page key map from previous search page. */
  pageKeyMap?: string;

  /** First characters of phone number. Case, whitespace & diacritic insensitive. */
  phone?: User['phone'];

  /** Sort results in descending order if `true`. */
  sortDesc?: boolean;

  /** Sort order of results. Default reflects search params, `created` if none. */
  sortOrder?: 'created' | 'name' | 'updated';

  /** Unix ms timestamp of earliest `updated` value. */
  updatedFrom?: User['updated'];

  /** Unix ms timestamp of latest `updated` value. */
  updatedTo?: User['updated'];
}

/**
 * Search for User records in the database.
 *
 * @category User
 */
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

  // Query database.
  const result = await queryBuilder.query({
    item: { beneficiaryId },
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
      property: sortOrder === 'name' ? 'lastNameRangeKey' : sortOrder,
      desc: sortDesc,
    },
  ]);

  return result;
};
