import {
  type Config,
  type ConfigMap,
  EntityManager,
} from '@karmaniverous/entity-manager';
import { defaultTranscodes, type Entity } from '@karmaniverous/entity-tools';

import { errorLogger } from './logger';

// Email entity interface.
export interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
}

// User entity interface.
export interface User extends Entity {
  beneficiaryId: string;
  created: number;
  firstName: string;
  firstNameCanonical: string;
  lastName: string;
  lastNameCanonical: string;
  phone?: string;
  updated: number;
  userId: string;
}

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
    created: { hashKey: 'hashKey', rangeKey: 'created' },
    firstName: { hashKey: 'hashKey', rangeKey: 'firstNameRangeKey' },
    lastName: { hashKey: 'hashKey', rangeKey: 'lastNameRangeKey' },
    phone: { hashKey: 'hashKey', rangeKey: 'phone' },
    updated: { hashKey: 'hashKey', rangeKey: 'updated' },
    userBeneficiaryCreated: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'created',
    },
    userBeneficiaryFirstName: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'firstNameRangeKey',
    },
    userBeneficiaryLastName: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'lastNameRangeKey',
    },
    userBeneficiaryPhone: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'phone',
    },
    userBeneficiaryUpdated: {
      hashKey: 'beneficiaryHashKey',
      rangeKey: 'updated',
    },
    userCreated: { hashKey: 'userHashKey', rangeKey: 'created' },
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
