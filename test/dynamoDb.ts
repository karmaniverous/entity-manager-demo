import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { EntityClient } from '@karmaniverous/entity-client-dynamodb';
import { retry } from 'radash';

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
    AttributeDefinitions: [
      {
        AttributeName: 'created',
        AttributeType: 'N',
      },
      {
        AttributeName: 'firstNameRangeKey',
        AttributeType: 'S',
      },
      {
        AttributeName: 'hashKey',
        AttributeType: 'S',
      },
      {
        AttributeName: 'lastNameRangeKey',
        AttributeType: 'S',
      },
      {
        AttributeName: 'phone',
        AttributeType: 'S',
      },
      {
        AttributeName: 'rangeKey',
        AttributeType: 'S',
      },
      {
        AttributeName: 'updated',
        AttributeType: 'N',
      },
      {
        AttributeName: 'userBeneficiaryHashKey',
        AttributeType: 'S',
      },
      {
        AttributeName: 'userHashKey',
        AttributeType: 'S',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'created',
        KeySchema: [
          { AttributeName: 'hashKey', KeyType: 'HASH' },
          { AttributeName: 'created', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'firstName',
        KeySchema: [
          { AttributeName: 'hashKey', KeyType: 'HASH' },
          { AttributeName: 'firstNameRangeKey', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'lastName',
        KeySchema: [
          { AttributeName: 'hashKey', KeyType: 'HASH' },
          { AttributeName: 'lastNameRangeKey', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'phone',
        KeySchema: [
          { AttributeName: 'hashKey', KeyType: 'HASH' },
          { AttributeName: 'phone', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'updated',
        KeySchema: [
          { AttributeName: 'hashKey', KeyType: 'HASH' },
          { AttributeName: 'updated', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'userCreated',
        KeySchema: [
          { AttributeName: 'userHashKey', KeyType: 'HASH' },
          { AttributeName: 'created', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'userBeneficiaryCreated',
        KeySchema: [
          { AttributeName: 'userBeneficiaryHashKey', KeyType: 'HASH' },
          { AttributeName: 'created', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'userBeneficiaryFirstName',
        KeySchema: [
          { AttributeName: 'userBeneficiaryHashKey', KeyType: 'HASH' },
          { AttributeName: 'firstNameRangeKey', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'userBeneficiaryLastName',
        KeySchema: [
          { AttributeName: 'userBeneficiaryHashKey', KeyType: 'HASH' },
          { AttributeName: 'lastNameRangeKey', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'userBeneficiaryPhone',
        KeySchema: [
          { AttributeName: 'userBeneficiaryHashKey', KeyType: 'HASH' },
          { AttributeName: 'phone', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'userBeneficiaryUpdated',
        KeySchema: [
          { AttributeName: 'userBeneficiaryHashKey', KeyType: 'HASH' },
          { AttributeName: 'updated', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    KeySchema: [
      {
        AttributeName: 'hashKey',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'rangeKey',
        KeyType: 'RANGE',
      },
    ],
    TableName: 'user',
  });
};
