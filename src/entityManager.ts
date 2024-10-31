import {
  type Config,
  EntityManager,
  type EntityMap,
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
// Using default values for HashKey, RangeKey, and TranscodeMap type params.
const config: Config<MyEntityMap> = {
  // Common hash & range key properties for all entities. Must exactly match
  // HashKey & RangeKey type params.
  hashKey: 'hashKey',
  rangeKey: 'rangeKey',

  // Entity-specific configs. Keys must exactly match those of MyEntityMap.
  entities: {
    // Email entity config.
    email: {
      // Source property for the Email entity's hash key.
      uniqueProperty: 'email',

      // Source property for timestamp used to calculate Email shard key.
      timestampProperty: 'created',

      // Email entity's shard bump schedule.
      // Records created before now are unsharded (1 possible shard key).
      // Records created after now have a 1-char, 2-bit shard key (4 possible shard keys).
      shardBumps: [{ timestamp: now, charBits: 2, chars: 1 }],

      // Email entity generated properties.
      // These keys must match the ones with never types in the Email interface.
      // These properties are marked with a ⚙️ in the table design at
      // https://karmanivero.us/projects/entity-manager/evolving-a-nosql-db-schema/#table-properties
      generated: {
        userHashKey: {
          atomic: true,
          elements: ['userId'],
          sharded: true,
        },
      },
      indexes: {
        created: ['hashKey', 'rangeKey', 'created'],
        userCreated: ['hashKey', 'rangeKey', 'userHashKey', 'created'],
      },
      elementTranscodes: {
        created: 'timestamp',
        userId: 'string',
      },
    },
    // User entity config.
    user: {
      // Source property for the User entity's hash key.
      uniqueProperty: 'userId',

      // Source property for timestamp used to calculate User shard key.
      timestampProperty: 'created',

      // User entity's shard bump schedule.
      // Records created before now are unsharded (1 possible shard key).
      // Records created after now have a 1-char, 2-bit shard key (4 possible shard keys).
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

export const entityManager = new EntityManager(config);
