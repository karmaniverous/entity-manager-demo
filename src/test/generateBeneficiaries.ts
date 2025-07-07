import { nanoid } from 'nanoid';

import type { Beneficiary } from '../entity-manager/Beneficiary';

/**
 * {@link generateBeneficiaries | `generateBeneficiaries`} config object.
 */
export interface GenerateBeneficiariesConfig {
  /** Number of Beneficiaries to generate. Default: `1` */
  count?: number;
}

/**
 * Generates an array of {@link Beneficiary | `Beneficiary`} objects.
 *
 * @param config - {@link GenerateBeneficiariesConfig | `GenerateBeneficiariesConfig`} object.
 *
 * @returns Array of {@link Beneficiary | `Beneficiary`} objects.
 */
export const generateBeneficiaries = (
  config: GenerateBeneficiariesConfig = {},
): Beneficiary[] => {
  const { count = 1 } = config;

  return [...(Array(count) as unknown[])].map(() => ({
    beneficiaryId: nanoid(),
  }));
};
