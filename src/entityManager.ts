import {
  type Config,
  EntityManager,
  type EntityMap,
  type ItemMap,
} from '@karmaniverous/entity-manager';
import type { Entity, PropertiesNotOfType } from '@karmaniverous/entity-tools';

import { errorLogger } from './logger';

// Email entity interface. never types indicate generated properties.
interface EmailEntity extends Entity {
  created: number;
  email: string;
  userHashKey: never; // generated
  userId: string;
}

// Email type for use outside data operations.
export type Email = Pick<EmailEntity, PropertiesNotOfType<EmailEntity, never>>;

// User entity interface. never types indicate generated properties.
interface UserEntity extends Entity {
  beneficiaryId: string;
  created: number;
  firstName: string;
  firstNameCanonical: string;
  firstNameRangeKey: never; // generated
  lastName: string;
  lastNameCanonical: string;
  lastNameRangeKey: never; // generated
  phone?: string;
  updated: number;
  userBeneficiaryHashKey: never; // generated
  userHashKey: never; // generated
  userId: string;
}

// Email type for use outside data operations.
export type User = Pick<UserEntity, PropertiesNotOfType<UserEntity, never>>;

// Entity interfaces combined into EntityMap.
interface MyEntityMap extends EntityMap {
  email: EmailEntity;
  user: UserEntity;
}

// Current timestamp will act as break point for sharding schedule.
const now = Date.now();

// Config object for EntityManager.
// Using default values for HashKey, RangeKey, and TranscodeMap
// type params.
const config: Config<MyEntityMap> = {
  // Common hash & range key properties for all entities. Must
  // exactly match HashKey & RangeKey type params.
  hashKey: 'hashKey',
  rangeKey: 'rangeKey',

  // Entity-specific configs. Keys must exactly match those of
  // MyEntityMap.
  entities: {
    // Email entity config.
    email: {
      // Source property for the Email entity's hash key.
      uniqueProperty: 'email',

      // Source property for timestamp used to calculate Email
      // shard key.
      timestampProperty: 'created',

      // Email entity's shard bump schedule. Records created before
      // now are unsharded (1 possible shard key). Records created
      // after now have a 1-char, 2-bit shard key (4 possible shard
      // keys).
      shardBumps: [{ timestamp: now, charBits: 2, chars: 1 }],

      // Email entity generated properties. These keys must match
      // the ones with never types in the Email interface defined
      // above, and are marked with a ⚙️ in the table design.
      generated: {
        userHashKey: {
          // When true, if any element is undefined or null, the
          // generated property will be undefined. When false,
          // undefined or null elements will be rendered as an
          // empty string.
          atomic: true,

          // Elements of the generated property. These MUST be
          // ungenerated properties (i.e. not marked with never
          // in the Email interface) and MUST be included in the
          // entityTranscodes object below. Elements are applied
          // in order.
          elements: ['userId'],

          // When this value is true, the generated property will
          // be sharded.
          sharded: true,
        },
      },

      // Indexes for the Email entity as specified in the index
      // design.
      indexes: {
        // Index components can be any combination of hashKey,
        // rangeKey, generated properties, and ungenerated
        // properties. Any ungenerated properties MUST be included
        // in the entityTranscodes object below. Property order is
        // not significant.
        created: { hashKey: 'hashKey', rangeKey: 'created' },
        userCreated: { hashKey: 'userHashKey', rangeKey: 'created' },
      },

      // Transcodes for ungenerated properties used as generated
      // property elements or index components. Transcode values
      // must be valid config transcodes object keys. Since this
      // config does not define a transcodes object it uses
      // defaultTranscodes exported by @karmaniverous/entity-tools.
      elementTranscodes: {
        created: 'timestamp',
        userId: 'string',
      },
    },
    // User entity config.
    user: {
      uniqueProperty: 'userId',
      timestampProperty: 'created',
      shardBumps: [{ timestamp: now, charBits: 2, chars: 1 }],
      generated: {
        firstNameRangeKey: {
          atomic: true,
          elements: ['firstNameCanonical', 'lastNameCanonical', 'created'],
        },
        lastNameRangeKey: {
          atomic: true,
          elements: ['lastNameCanonical', 'firstNameCanonical', 'created'],
        },
        userBeneficiaryHashKey: {
          atomic: true,
          elements: ['beneficiaryId'],
          sharded: true,
        },
        userHashKey: {
          atomic: true,
          elements: ['userId'],
          sharded: true,
        },
      },
      indexes: {
        created: { hashKey: 'hashKey', rangeKey: 'created' },
        firstName: { hashKey: 'hashKey', rangeKey: 'firstNameRangeKey' },
        lastName: { hashKey: 'hashKey', rangeKey: 'lastNameRangeKey' },
        phone: { hashKey: 'hashKey', rangeKey: 'phone' },
        updated: { hashKey: 'hashKey', rangeKey: 'updated' },
        userBeneficiaryCreated: {
          hashKey: 'userBeneficiaryHashKey',
          rangeKey: 'created',
        },
        userBeneficiaryFirstName: {
          hashKey: 'userBeneficiaryHashKey',
          rangeKey: 'firstNameRangeKey',
        },
        userBeneficiaryLastName: {
          hashKey: 'userBeneficiaryHashKey',
          rangeKey: 'lastNameRangeKey',
        },
        userBeneficiaryPhone: {
          hashKey: 'userBeneficiaryHashKey',
          rangeKey: 'phone',
        },
        userBeneficiaryUpdated: {
          hashKey: 'userBeneficiaryHashKey',
          rangeKey: 'updated',
        },
      },
      elementTranscodes: {
        beneficiaryId: 'string',
        created: 'timestamp',
        firstNameCanonical: 'string',
        lastNameCanonical: 'string',
        phone: 'string',
        updated: 'timestamp',
        userId: 'string',
      },
    },
  },
};

// Configure & export EntityManager instance.
export const entityManager = new EntityManager(config, errorLogger);

// Construct ItemMap type from MyEntityMap.
type MyItemMap = ItemMap<MyEntityMap>;

// Export EmailItem & UserItem types for use in other modules.
export type EmailItem = MyItemMap['email'];
export type UserItem = MyItemMap['user'];
