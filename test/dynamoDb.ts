import {
  EntityClient,
  generateTableDefinition,
} from '@karmaniverous/entity-client-dynamodb';

import { entityManager } from '../src/entityManager';

export const createUserTable = async (entityClient: EntityClient) => {
  await entityClient.createTable({
    ...generateTableDefinition(entityManager),
    BillingMode: 'PAY_PER_REQUEST',
    TableName: 'UserService',
  });
};
