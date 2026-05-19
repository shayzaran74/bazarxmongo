import { Schema, model, Types } from 'mongoose';

// PlatinumMissionLog — generated from Prisma schema
// TODO: strict typing — codegen

export interface IPlatinumMissionLog {
  _id?: string;
  id: string;
  userId: string;
  missionId: string;
  vendorId?: string;
  totalAmount?: Types.Decimal128;
  orderCount?: number;
  xpEarned?: number;
  completedAt?: Date;
  createdAt: Date;
}

export const PlatinumMissionLogSchema = new Schema<IPlatinumMissionLog>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  missionId: { type: String, alias: 'mission_id' },
  vendorId: { type: String, alias: 'vendor_id' },
  totalAmount: { type: Types.Decimal128, alias: 'total_amount' },
  orderCount: { type: Number, alias: 'order_count' },
  xpEarned: { type: Number, alias: 'xp_earned' },
  completedAt: { type: Date, alias: 'completed_at' },
  createdAt: { type: Date, alias: 'created_at' },
}, {
  timestamps: true,
  collection: 'platinum_mission_logs',
});

// Composite index
PlatinumMissionLogSchema.index({ userId: 1, vendorId: 1 });

export const PlatinumMissionLog = model<IPlatinumMissionLog>('PlatinumMissionLog', PlatinumMissionLogSchema);
