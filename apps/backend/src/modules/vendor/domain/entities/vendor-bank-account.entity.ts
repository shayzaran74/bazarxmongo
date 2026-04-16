// apps/backend/src/modules/vendor/domain/entities/vendor-bank-account.entity.ts

import { Entity } from '@barterborsa/shared-core';
import { IBAN } from '../value-objects/iban.vo';

export interface VendorBankAccountProps {
  vendorId: string;
  iban: IBAN;
  accountHolderName: string;
  accountNumber?: string;
  bankName: string;
  isPrimary: boolean;
}

export class VendorBankAccount extends Entity<VendorBankAccountProps> {
  private constructor(props: VendorBankAccountProps, id?: string) {
    super(props, id);
  }

  public static create(props: VendorBankAccountProps): VendorBankAccount {
    return new VendorBankAccount(props);
  }

  public setAsPrimary(): void {
    this.props.isPrimary = true;
    this._updatedAt = new Date();
  }

  public unsetAsPrimary(): void {
    this.props.isPrimary = false;
    this._updatedAt = new Date();
  }

  get iban(): IBAN { return this.props.iban; }
  get isPrimary(): boolean { return this.props.isPrimary; }
}
