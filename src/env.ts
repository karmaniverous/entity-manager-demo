import { toInt } from 'radash';

/**
 * Centralized environment parsing.
 *
 * Keep all demo env reads in one place to make it obvious what
 * can be configured and to keep parsing consistent in tests and
 * runtime code.
 */
export const env = {
  /** Port used by DynamoDB Local Docker container (default 8000). */
  dynamoDbLocalPort: toInt(process.env.DYNAMODB_LOCAL_PORT ?? '8000'),
};
