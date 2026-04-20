// apps/backend/src/modules/vendor/domain/entities/company.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { TaxNumber } from '../value-objects/tax-number.vo';

export interface CompanyProps {
  taxNumber?: TaxNumber;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  registrationNumber?: string;
  taxOffice?: string;
  representativeName?: string;
  representativePhone?: string;
  vatRate: number;
  status: string; // PENDING, VERIFIED, REJECTED
  companyType?: string;
  tradeRegistryNumber?: string;
  mersisNumber?: string;
  kepAddress?: string;
  verifiedAt?: Date;
  deletedAt?: Date;
}

export class Company extends AggregateRoot<CompanyProps> {
  protected constructor(props: CompanyProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: CompanyProps, id: string): Company {
    return new Company(props, id);
  }

  public static create(props: Omit<CompanyProps, 'status' | 'verifiedAt' | 'deletedAt' | 'vatRate'> & { vatRate?: number }): Company {
    return new Company({
      ...props,
      status: 'PENDING',
      vatRate: props.vatRate ?? 20.0,
    });
  }

  public verify(): void {
    this.props.status = 'VERIFIED';
    this.props.verifiedAt = new Date();
    this._updatedAt = new Date();
  }

  public softDelete(): void {
    this.props.deletedAt = new Date();
    this._updatedAt = new Date();
  }

  // Getter methods
  get taxNumber(): TaxNumber | undefined { return this.props.taxNumber; }
  get name(): string { return this.props.name; }
  get status(): string { return this.props.status; }
}
