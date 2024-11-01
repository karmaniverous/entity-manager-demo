import { EntityClient } from '@karmaniverous/entity-client-dynamodb';

export const entityClient = new EntityClient({
  credentials: {
    accessKeyId: 'fakeAccessKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
  },
  endpoint: 'http://localhost:8000',
  region: 'local',
});
