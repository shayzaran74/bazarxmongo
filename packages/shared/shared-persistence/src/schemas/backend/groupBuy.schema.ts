import { Schema, model, Types } from 'mongoose';

// GroupBuy — generated from Prisma schema
// TODO: strict typing — codegen

export interface IGroupBuy {
  _id?: string;
  id: string;
  listingId?: string;
  targetQuantity: number;
  currentQuantity: number;
  price: Types.Decimal128;
  endDate: Date;
  status: string;
  createdAt: Date;
  productId?: string;
  startDate?: Date;
  tiers?: Schema.Types.Mixed;
  title?: string;
}

export const GroupBuySchema = new Schema<IGroupBuy>({
  _id: { type: String, default: () => new Types.ObjectId().toString() },
  id: { type: String, required: true },
  listingId: { type: String, alias: 'listing_id' },
  targetQuantity: { type: Number, default: 0, alias: 'target_quantity' },
  currentQuantity: { type: Number, default: 0, alias: 'current_quantity' },
  price: { type: Types.Decimal128, default: 0 },
  endDate: { type: Date, alias: 'end_date' },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, alias: 'created_at' },
  productId: { type: String, alias: 'product_id' },
  startDate: { type: Date, alias: 'start_date' },
  tiers: { type: Schema.Types.Mixed },
  title: { type: String },
}, {
  timestamps: true,
  collection: 'group_buys',
});

// Composite index
GroupBuySchema.index({ listingId: 1 });

// Composite index
GroupBuySchema.index({ productId: 1 });

export const GroupBuy = model<IGroupBuy>('GroupBuy', GroupBuySchema);
