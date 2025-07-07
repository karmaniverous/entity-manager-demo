import { faker } from '@faker-js/faker';

import type { Beneficiary } from '../entity-manager/Beneficiary';
import { CreateUserParams } from '../handlers';

/**
 * {@link generateUsers | `generateUsers`} config object.
 */
export interface GenerateUsersConfig {
  /** Number of Users to generate. Default: `1` */
  count?: number;

  /** Array of Beneficiary objects to assign randomly to Users. */
  beneficiaries: Beneficiary[];
}

/**
 * Generates an array of {@link CreateUserParams | `CreateUserParams`} objects.
 *
 * @param config - {@link GenerateUsersConfig | `GenerateUsersConfig`} object.
 *
 * @returns Array of {@link CreateUserParams | `CreateUserParams`} objects.
 */
export const generateUsers = (
  config: GenerateUsersConfig,
): CreateUserParams[] => {
  const { beneficiaries, count = 1 } = config;

  return [...(Array(count) as unknown[])].map(() => ({
    beneficiaryId:
      beneficiaries[Math.floor(Math.random() * beneficiaries.length)]
        .beneficiaryId,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }));
};
