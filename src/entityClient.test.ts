import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { expect } from 'chai';

import { setupDynamoDbLocal, teardownDynamoDbLocal } from '../test/docker';
import { createUserTable, dynamoDbReady } from '../test/dynamoDb';
import { entityClient } from './entityClient';
import { env } from './env';

describe('entityClient', function () {
  before(async function () {
    await setupDynamoDbLocal(env.dynamoDbLocalPort);
    await dynamoDbReady(entityClient);
  });

  it('creates & deletes user table', async function () {
    await createUserTable(entityClient);
    let tables = await entityClient.client.send(new ListTablesCommand());
    expect(tables.TableNames).to.deep.equal(['user']);

    await entityClient.deleteTable({ TableName: 'user' });
    tables = await entityClient.client.send(new ListTablesCommand());
    expect(tables.TableNames).to.deep.equal([]);
  });

  after(async function () {
    await teardownDynamoDbLocal();
  });
});
