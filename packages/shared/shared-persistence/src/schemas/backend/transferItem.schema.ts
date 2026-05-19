import { Schema, model, Types } from 'mongoose';

// TransferItem — generated from Prisma schema
// TODO: strict typing — codegen

export interface ITransferItem {
  _id?: string;
  id: string;
  transferId: string;
  listingId: string;
  quantity: number;
}

export const TransferItemSchema = new Schema<ITransferItem>({
  _id: { type: String },
  id: { type: String, required: true },
  transferId: { type: String, alias: 'transfer_id' },
  listingId: { type: String, alias: 'listing_id' },
  quantity: { type: Number },
}, {
  timestamps: true,
  collection: 'transfer_items',
});

// Composite index
TransferItemSchema.index({ listingId: 1 });

export const TransferItem = model<ITransferItem>('TransferItem', TransferItemSchema);
