import {
  type Config,
  type ConfigMap,
  EntityManager,
} from '@karmaniverous/entity-manager';
import { defaultTranscodes } from '@karmaniverous/entity-tools';

import { errorLogger } from '../util/logger';
import { Email } from './Email';
import { User } from './User';

// Entity interfaces combined into EntityMap.
export type MyConfigMap = ConfigMap<{
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
}>;

// Current timestamp will act as break point for sharding schedule.
const now = Date.now();

// Config object for EntityManager.
const config: Config<MyConfigMap> = {
  hashKey: 'hashKey',
  rangeKey: 'rangeKey',

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
      beneficiaryHashKey: ['beneficiaryId'],
      userHashKey: ['userId'],
    },
    unsharded: {
      firstNameRangeKey: ['firstNameCanonical', 'lastNameCanonical', 'created'],
      lastNameRangeKey: ['lastNameCanonical', 'firstNameCanonical', 'created'],
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
  },
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
};

// Configure & export EntityManager instance.
export const entityManager = new EntityManager(config, errorLogger);
