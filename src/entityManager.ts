import {
  type Config,
  EntityManager,
  type EntityMap,
  type ItemMap,
} from '@karmaniverous/entity-manager';
import type { Entity } from '@karmaniverous/entity-tools';

// Email interface. never types indicate generated properties.
interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
  userHashKey: never; // generated
}

// User interface. never types indicate generated properties.
interface User extends Entity {
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
  userId: string;
  userHashKey: never; // generated
}

// Entity interfaces combined into EntityMap.
interface MyEntityMap extends EntityMap {
  email: Email;
  user: User;
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
        created: ['hashKey', 'rangeKey', 'created'],
        userCreated: ['hashKey', 'rangeKey', 'userHashKey', 'created'],
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
        created: ['hashKey', 'rangeKey', 'created'],
        firstName: ['hashKey', 'rangeKey', 'firstNameRangeKey'],
        lastname: ['hashKey', 'rangeKey', 'lastNameRangeKey'],
        phone: ['hashKey', 'rangeKey', 'phone'],
        updated: ['hashKey', 'rangeKey', 'updated'],
        userBeneficiaryCreated: [
          'hashKey',
          'rangeKey',
          'userBeneficiaryHashKey',
          'created',
        ],
        userBeneficiaryFirstName: [
          'hashKey',
          'rangeKey',
          'userBeneficiaryHashKey',
          'firstNameRangeKey',
        ],
        userBeneficiaryLastName: [
          'hashKey',
          'rangeKey',
          'userBeneficiaryHashKey',
          'lastNameRangeKey',
        ],
        userBeneficiaryPhone: [
          'hashKey',
          'rangeKey',
          'userBeneficiaryHashKey',
          'phone',
        ],
        userBeneficiaryUpdated: [
          'hashKey',
          'rangeKey',
          'userBeneficiaryHashKey',
          'updated',
        ],
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
export const entityManager = new EntityManager(config);

// Construct ItemMap type from MyEntityMap.
type MyItemMap = ItemMap<MyEntityMap>;

// Export EmailItem & UserItem types for use in other modules.
export type EmailItem = MyItemMap['email'];
export type UserItem = MyItemMap['user'];
