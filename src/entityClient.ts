import { EntityClient } from '@karmaniverous/entity-client-dynamodb';

import { errorLogger } from './logger';

export const entityClient = new EntityClient({
  credentials: {
    accessKeyId: 'fakeAccessKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
  },
  endpoint: 'http://localhost:8000',
  logger: errorLogger,
  region: 'local',
});
