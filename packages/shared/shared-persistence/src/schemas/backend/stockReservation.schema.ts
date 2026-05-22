import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export interface IStockReservation {
  _id?: string;
  id: string;
  stockId: string;
  orderId?: string;
  quantity: number;
  expiresAt: Date;
  isComplete: boolean;
  createdAt: Date;
}

export const StockReservationSchema = new Schema<IStockReservation>({
  _id: { type: String },
  id: { type: String, required: true },
  stockId: { type: String },
  orderId: { type: String },
  quantity: { type: Number },
  expiresAt: { type: Date },
  isComplete: { type: Boolean, default: false },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'stock_reservations',
});

StockReservationSchema.index({ stockId: 1 });
StockReservationSchema.index({ orderId: 1 });
StockReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const StockReservation = createModelProxy<IStockReservation>('StockReservation', StockReservationSchema);