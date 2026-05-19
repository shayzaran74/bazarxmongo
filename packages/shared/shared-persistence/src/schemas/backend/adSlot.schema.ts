import { Schema, model, Types } from 'mongoose';

// AdSlot — generated from Prisma schema
// TODO: strict typing — codegen

export interface IAdSlot {
  _id?: string;
  id: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export const AdSlotSchema = new Schema<IAdSlot>({
  _id: { type: String },
  id: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'ad_slots',
});

// Unique constraint
AdSlotSchema.index({ slotType: 1, platform: 1 }, { unique: true });

export const AdSlot = model<IAdSlot>('AdSlot', AdSlotSchema);
