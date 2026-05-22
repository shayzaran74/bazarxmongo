import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// packages/shared/shared-persistence/src/schemas/backend/launchPartner.schema.ts

export const LaunchPartnerPhase = ['PHASE_1', 'PHASE_2', 'PHASE_3'] as const;
export type LaunchPartnerPhaseType = typeof LaunchPartnerPhase[number];

export interface ILaunchPartner {
  _id?: string;
  id: string;
  vendorId: string;
  phase: LaunchPartnerPhaseType;
  pledgedMenuCount: number;
  distributedCount: number;
  freeAdMonths: number;
  adMonthsUsed: number;
  startDate: Date;
  phase2StartDate?: Date;
  phase3StartDate?: Date;
  notes?: string;
}

export const LaunchPartnerSchema = new Schema<ILaunchPartner>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  phase: { type: String, enum: LaunchPartnerPhase, default: 'PHASE_1' },
  pledgedMenuCount: { type: Number, default: 60, alias: 'pledged_menu_count' },
  distributedCount: { type: Number, default: 0, alias: 'distributed_count' },
  freeAdMonths: { type: Number, default: 1, alias: 'free_ad_months' },
  adMonthsUsed: { type: Number, default: 0, alias: 'ad_months_used' },
  startDate: { type: Date, alias: 'start_date' },
  phase2StartDate: { type: Date, alias: 'phase2_start_date' },
  phase3StartDate: { type: Date, alias: 'phase3_start_date' },
  notes: { type: String },
}, {
  timestamps: true,
  collection: 'launch_partners',
});

LaunchPartnerSchema.index({ vendorId: 1 }, { unique: true });
LaunchPartnerSchema.index({ phase: 1 });

export const LaunchPartner = createModelProxy<ILaunchPartner>('LaunchPartner', LaunchPartnerSchema);
