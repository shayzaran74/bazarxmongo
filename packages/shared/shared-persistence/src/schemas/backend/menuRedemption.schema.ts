import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export interface IMenuRedemption {
  _id?: string;
  id: string;
  purchaseId: string;
  isOneFree: boolean;
  redeemedAt: Date;
  scannedByStaff?: string;
}

export const MenuRedemptionSchema = new Schema<IMenuRedemption>({
  _id: { type: String },
  id: { type: String, required: true },
  purchaseId: { type: String },
  isOneFree: { type: Boolean, default: false },
  redeemedAt: { type: Date },
  scannedByStaff: { type: String },
}, {
  timestamps: true,
  collection: 'menu_redemptions',
});

MenuRedemptionSchema.index({ purchaseId: 1 });
MenuRedemptionSchema.index({ redeemedAt: -1 });

export const MenuRedemption = createModelProxy<IMenuRedemption>('MenuRedemption', MenuRedemptionSchema);