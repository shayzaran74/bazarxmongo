// apps/financial-service/src/modules/ledger/domain/entities/general-ledger-entry.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Decimal } from 'decimal.js';

interface GeneralLedgerEntryProps {
  type: string;
  debitAccountId?: string;
  creditAccountId?: string;
  amount: Decimal;
  referenceId?: string;
  refType?: string;
  note?: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
}

export class GeneralLedgerEntry extends AggregateRoot<GeneralLedgerEntryProps> {
  constructor(props: GeneralLedgerEntryProps, id?: string) {
    super(props, id);
  }

  get type(): string { return this.props.type; }
  get debitAccountId(): string | undefined { return this.props.debitAccountId; }
  get creditAccountId(): string | undefined { return this.props.creditAccountId; }
  get amount(): Decimal { return this.props.amount; }
  get referenceId(): string | undefined { return this.props.referenceId; }
  get refType(): string | undefined { return this.props.refType; }
  get note(): string | undefined { return this.props.note; }
  get payload(): Record<string, unknown> | undefined { return this.props.payload; }
  get createdAt(): Date { return this.props.createdAt; }

  static create(props: Omit<GeneralLedgerEntryProps, 'createdAt'>): GeneralLedgerEntry {
    return new GeneralLedgerEntry({
      ...props,
      createdAt: new Date(),
    });
  }
}
