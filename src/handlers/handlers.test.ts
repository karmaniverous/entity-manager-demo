import {
  dynamoDbLocalReady,
  setupDynamoDbLocal,
  teardownDynamoDbLocal,
} from '@karmaniverous/dynamodb-local';
import { generateTableDefinition } from '@karmaniverous/entity-client-dynamodb';

import { type Beneficiary, entityClient } from '../entity-manager';
import { env } from '../env';
import { generateBeneficiaries, generateUsers } from '../test';
import {
  createUser,
  type CreateUserParams,
  deleteUser,
  readUser,
  updateUser,
} from './';

describe('handlers', function () {
  let beneficiaries: Beneficiary[];
  let createUserParams: CreateUserParams[];

  beforeAll(async function () {
    // Set up DynamoDB Local.
    await setupDynamoDbLocal(env.dynamoDbLocalPort);
    await dynamoDbLocalReady(entityClient.client);

    // Create UserService table.
    await entityClient.createTable({
      ...generateTableDefinition(entityClient.entityManager),
      BillingMode: 'PAY_PER_REQUEST',
    });

    // Create beneficiaries & users.
    beneficiaries = generateBeneficiaries({ count: 3 });
    createUserParams = generateUsers({ beneficiaries, count: 100 });
  });

  afterAll(async function () {
    // Tear down DynamoDB Local.
    await teardownDynamoDbLocal();
  });

  describe('users', function () {
    it('crud user record', async function () {
      // Create user record.
      const created = await createUser(createUserParams[0]);

      expect(created).to.deep.include(createUserParams[0]);

      // Read user record.
      const read = await readUser(created.userId);

      expect(read[0]).to.deep.equal(created);
      if (!read.length) return;

      // Update user record.
      const updated = await updateUser({
        userId: read[0].userId,
        ...createUserParams[2],
      });

      expect(updated).to.deep.include(createUserParams[2]);

      // Read updated user record.
      const readUpdated = await readUser(updated[0].userId);
      expect(readUpdated).to.deep.equal(updated);

      // Delete user record.
      await deleteUser(updated[0].userId);

      // Read deleted user record.
      const readDeleted = await readUser(updated[0].userId);
      expect(readDeleted).to.be.undefined;
    });
  });
});
