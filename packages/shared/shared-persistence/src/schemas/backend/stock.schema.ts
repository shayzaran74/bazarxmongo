import { Schema, model } from 'mongoose';

export interface IStock {
  _id?: string;
  id: string;
  listingId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  updatedAt: Date;
}

export const StockSchema = new Schema<IStock>({
  _id: { type: String },
  id: { type: String, required: true },
  listingId: { type: String },
  warehouseId: { type: String },
  quantity: { type: Number, default: 0 },
  reservedQuantity: { type: Number, default: 0 },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'stocks',
});

StockSchema.index({ listingId: 1, warehouseId: 1 }, { unique: true });
StockSchema.index({ listingId: 1 });

export const Stock = model<IStock>('Stock', StockSchema);