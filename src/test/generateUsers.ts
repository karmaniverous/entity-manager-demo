import { faker } from '@faker-js/faker';

import type { Beneficiary } from '../entity-manager/Beneficiary';
import { createUser } from '../handlers';

export interface CreateUsersConfig {
  count?: number;
  beneficiaries: Beneficiary[];
}

export const generateUsers = (
  config: CreateUsersConfig,
): Parameters<typeof createUser>[0][] => {
  const { beneficiaries, count = 1 } = config;

  return [...(Array(count) as unknown[])].map(() => ({
    beneficiaryId:
      beneficiaries[Math.floor(Math.random() * beneficiaries.length)]
        .beneficiaryId,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }));
};
