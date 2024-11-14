import { nanoid } from 'nanoid';

import type { Beneficiary } from '../entity-manager/Beneficiary';

export interface CreateBeneficiariesConfig {
  count?: number;
}

export const generateBeneficiaries = (
  config: CreateBeneficiariesConfig = {},
): Beneficiary[] => {
  const { count = 1 } = config;

  return [...(Array(count) as unknown[])].map(() => ({
    beneficiaryId: nanoid(),
  }));
};
