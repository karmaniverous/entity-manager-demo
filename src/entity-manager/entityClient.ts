import { EntityClient } from '@karmaniverous/entity-client-dynamodb';

import { errorLogger } from '../util/logger';
import { entityManager } from './entityManager';

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
