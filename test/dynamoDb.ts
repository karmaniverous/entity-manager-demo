import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import {
  EntityClient,
  generateTableDefinition,
} from '@karmaniverous/entity-client-dynamodb';
import { retry } from 'radash';

import { entityManager } from '../src/entityManager';

export const dynamoDbReady = async (
  entityClient: EntityClient,
): Promise<void> => {
  await retry(
    {
      backoff(i) {
        const wait = 2 ** (i - 1);
        console.log(
          `DynamoDb unavailable. Retrying in ${wait.toString()} seconds...`,
        );
        return wait * 1000;
      },
      times: 10,
    },
    async () => await entityClient.client.send(new ListTablesCommand()),
  );
};

export const createUserTable = async (entityClient: EntityClient) => {
  await entityClient.createTable({
    ...generateTableDefinition(entityManager),
    BillingMode: 'PAY_PER_REQUEST',
    TableName: 'user',
  });
};
