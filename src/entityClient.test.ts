import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import {
  dynamoDbLocalReady,
  setupDynamoDbLocal,
  teardownDynamoDbLocal,
} from '@karmaniverous/dynamodb-local';
import { generateTableDefinition } from '@karmaniverous/entity-client-dynamodb';
import { expect } from 'chai';

import { entityClient } from './entityClient';
import { env } from './env';

describe('entityClient', function () {
  before(async function () {
    await setupDynamoDbLocal(env.dynamoDbLocalPort);
    await dynamoDbLocalReady(entityClient.client);
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

  after(async function () {
    await teardownDynamoDbLocal();
  });
});
