import { Schema, model, Types } from 'mongoose';

export const LedgerEntryType = ['DEBIT','CREDIT'] as const;
export type LedgerEntryTypeType = typeof LedgerEntryType[number];

export interface IGeneralLedger {
  _id?: string;
  id: string;
  payload?: Schema.Types.Mixed;
  note?: string;
  actorId?: string;
  amount?: Types.Decimal128;
  createdAt: Date;
  creditAccountId?: string;
  debitAccountId?: string;
  refType?: string;
  referenceId?: string;
  type: LedgerEntryTypeType;
}

export const GeneralLedgerSchema = new Schema<IGeneralLedger>({
  _id: { type: String },
  id: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  note: { type: String },
  actorId: { type: String },
  amount: { type: Types.Decimal128 },
  createdAt: { type: Date },
  creditAccountId: { type: String },
  debitAccountId: { type: String },
  refType: { type: String },
  referenceId: { type: String },
  type: { type: String, enum: LedgerEntryType },
}, {
  timestamps: true,
  collection: 'general_ledger',
});

GeneralLedgerSchema.index({ type: 1, referenceId: 1 });
GeneralLedgerSchema.index({ createdAt: -1 });
GeneralLedgerSchema.index({ debitAccountId: 1 });
GeneralLedgerSchema.index({ creditAccountId: 1 });
GeneralLedgerSchema.index({ referenceId: 1, refType: 1 });

export const GeneralLedger = model<IGeneralLedger>('GeneralLedger', GeneralLedgerSchema);