import {
  type Config,
  EntityManager,
  type EntityMap,
} from '@karmaniverous/entity-manager';
import type { Entity } from '@karmaniverous/entity-tools';

interface Email extends Entity {
  created: number;
  email: string;
  userId: string;
  userHashKey: never;
}

interface User extends Entity {
  beneficiaryId: string;
  created: number;
  firstName: string;
  firstNameCanonical: string;
  firstNameRangeKey: never;
  lastName: string;
  lastNameCanonical: string;
  lastNameRangeKey: never;
  phone?: string;
  updated: number;
  userBeneficiaryHashKey: never;
  userId: string;
  userHashKey: never;
}

interface MyEntityMap extends EntityMap {
  email: Email;
  user: User;
}

const config: Config<MyEntityMap> = {
  entities: {
    email: {
      elementTranscodes: {
        created: 'timestamp',
        userId: 'string',
      },
      indexes: {
        created: ['hashKey', 'rangeKey', 'created'],
        userCreated: ['hashKey', 'rangeKey', 'userHashKey', 'created'],
      },
      generated: {
        userHashKey: {
          atomic: true,
          elements: ['userId'],
          sharded: true,
        },
      },
      timestampProperty: 'created',
      uniqueProperty: 'email',
    },
    user: {
      elementTranscodes: {
        beneficiaryId: 'string',
        created: 'timestamp',
        firstNameCanonical: 'string',
        lastNameCanonical: 'string',
        phone: 'string',
        updated: 'timestamp',
        userId: 'string',
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
      timestampProperty: 'created',
      uniqueProperty: 'userId',
    },
  },
  hashKey: 'hashKey',
  rangeKey: 'rangeKey',
};

export const entityManager = new EntityManager(config);
