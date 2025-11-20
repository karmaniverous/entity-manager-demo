import { createEntityManager } from '@karmaniverous/entity-manager';
import { defaultTranscodes } from '@karmaniverous/entity-tools';
import type { ConfigInput } from '@karmaniverous/entity-manager';

import { errorLogger } from '../util/logger';
import { emailSchema, userSchema } from './schemas';
import type { Email, User } from './types';

// Entity interfaces combined into EntityMap.
export interface MyConfigMap {
  EntityMap: {
    email: Email;
    user: User;
  };
  ShardedKeys: 'beneficiaryHashKey' | 'userHashKey';
  UnshardedKeys: 'firstNameRangeKey' | 'lastNameRangeKey';
  TranscodedProperties:
    | 'beneficiaryId'
    | 'created'
    | 'email'
    | 'firstNameCanonical'
    | 'lastNameCanonical'
    | 'phone'
    | 'updated'
    | 'userId';
}

// Current timestamp will act as break point for sharding schedule.
const now = Date.now();

// Config object for EntityManager.
const config = {
  hashKey: 'hashKey',
  rangeKey: 'rangeKey',
  entitiesSchema: {
    email: emailSchema,
    user: userSchema,
  } as const,

  entities: {
    email: {
      uniqueProperty: 'email',
      timestampProperty: 'created',
      shardBumps: [{ timestamp: now, charBits: 2, chars: 1 }],
    },
    user: {
      uniqueProperty: 'userId',
      timestampProperty: 'created',
      shardBumps: [{ timestamp: now, charBits: 2, chars: 1 }],
    },
  },
  generatedProperties: {
    sharded: {
      beneficiaryHashKey: ['beneficiaryId'] as const,
      userHashKey: ['userId'] as const,
    },
    unsharded: {
      firstNameRangeKey: [
        'firstNameCanonical',
        'lastNameCanonical',
        'created',
      ] as const,
      lastNameRangeKey: [
        'lastNameCanonical',
        'firstNameCanonical',
        'created',
      ] as const,
    },
  },
  indexes: {
    created: { hashKey: 'hashKey', rangeKey: 'created', projections: [] },
    firstName: {
      hashKey: 'hashKey',
      rangeKey: 'firstNameRangeKey',
      projections: [],
    },
    lastName: {
      hashKey: 'hashKey',
      rangeKey: 'lastNameRangeKey',
      projections: [],
    },
    phone: { hashKey: 'hashKey', rangeKey: 'phone', projections: [] },
    updated: { hashKey: 'hashKey', rangeKey: 'updated', projections: [] },
    userBeneficiaryCreated: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'created',
      projections: [],
    },
    userBeneficiaryFirstName: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'firstNameRangeKey',
      projections: [],
    },
    userBeneficiaryLastName: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'lastNameRangeKey',
      projections: [],
    },
    userBeneficiaryPhone: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'phone',
      projections: [],
    },
    userBeneficiaryUpdated: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'updated',
      projections: [],
    },
    userCreated: {
      hashKey: 'userHashKey',
      rangeKey: 'created',
      projections: [],
    },
  } as const,
  propertyTranscodes: {
    beneficiaryId: 'string',
    created: 'timestamp',
    email: 'string',
    firstNameCanonical: 'string',
    lastNameCanonical: 'string',
    phone: 'string',
    updated: 'timestamp',
    userId: 'string',
  },
  transcodes: defaultTranscodes,
} satisfies ConfigInput;

// Configure & export EntityManager instance.
export const entityManager = createEntityManager(config, errorLogger);
