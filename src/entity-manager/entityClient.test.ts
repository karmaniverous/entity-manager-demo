import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import {
  dynamoDbLocalReady,
  setupDynamoDbLocal,
  teardownDynamoDbLocal,
} from '@karmaniverous/dynamodb-local';
import { generateTableDefinition } from '@karmaniverous/entity-client-dynamodb';

import { env } from '../env';
import { entityClient } from './entityClient';

describe('entityClient', function () {
  beforeAll(async function () {
    // Set up DynamoDB Local.
    await setupDynamoDbLocal(env.dynamoDbLocalPort);
    await dynamoDbLocalReady(entityClient.client);
  });

  afterAll(async function () {
    // Tear down DynamoDB Local.
    await teardownDynamoDbLocal();
  });

  it('creates & deletes user table', async function () {
    await entityClient.createTable({
      ...generateTableDefinition(entityClient.entityManager),
      BillingMode: 'PAY_PER_REQUEST',
    });

    let tables = await entityClient.client.send(new ListTablesCommand());
    expect(tables.TableNames).to.deep.equal([entityClient.tableName]);

    await entityClient.deleteTable();
    tables = await entityClient.client.send(new ListTablesCommand());
    expect(tables.TableNames).to.deep.equal([]);
  });
});
