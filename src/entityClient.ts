import { EntityClient } from '@karmaniverous/entity-client-dynamodb';

import { entityManager } from './entityManager';
import { errorLogger } from './logger';

export const entityClient = new EntityClient({
  credentials: {
    accessKeyId: 'fakeAccessKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
  },
  endpoint: 'http://localhost:8000',
  entityManager,
  logger: errorLogger,
  region: 'local',
  tableName: 'UserService',
});
