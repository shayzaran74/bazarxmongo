// apps/backend/src/modules/vendor/domain/repositories/company.repository.interface.ts

import { Company } from '../entities/company.entity';
import { IRepository } from '@barterborsa/shared-core';
import { TaxNumber } from '../value-objects/tax-number.vo';

export interface ICompanyRepository extends IRepository<Company> {
  findByTaxNumber(taxNumber: TaxNumber): Promise<Company | null>;
  existsByTaxNumber(taxNumber: TaxNumber): Promise<boolean>;
}
