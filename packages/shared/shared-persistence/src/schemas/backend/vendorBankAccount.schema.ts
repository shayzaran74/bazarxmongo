import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// VendorBankAccount — generated from Prisma schema
// TODO: strict typing — codegen

export interface IVendorBankAccount {
  _id?: string;
  id: string;
  iban: string;
  accountHolderName: string;
  accountNumber?: string;
  bankName: string;
  createdAt: Date;
  isPrimary: boolean;
  updatedAt: Date;
  vendorId: string;
}

export const VendorBankAccountSchema = new Schema<IVendorBankAccount>({
  _id: { type: String },
  id: { type: String, required: true },
  iban: { type: String },
  accountHolderName: { type: String, alias: 'account_holder_name' },
  accountNumber: { type: String, alias: 'account_number' },
  bankName: { type: String, alias: 'bank_name' },
  createdAt: { type: Date, alias: 'created_at' },
  isPrimary: { type: Boolean, default: false, alias: 'is_primary' },
  updatedAt: { type: Date, alias: 'updated_at' },
  vendorId: { type: String, alias: 'vendor_id' },
}, {
  timestamps: true,
  collection: 'vendor_bank_accounts',
});

export const VendorBankAccount = createModelProxy<IVendorBankAccount>('VendorBankAccount', VendorBankAccountSchema);
