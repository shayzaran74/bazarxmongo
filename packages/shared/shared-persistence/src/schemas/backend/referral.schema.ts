import { Schema, model } from 'mongoose';

export interface IReferral {
  _id?: string;
  id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  xpGranted: number;
  bonusGranted: boolean;
  rewardGrantedAt?: Date;
  createdAt: Date;
}

export const ReferralSchema = new Schema<IReferral>({
  _id: { type: String },
  id: { type: String, required: true },
  referrerId: { type: String },
  refereeId: { type: String },
  referralCode: { type: String },
  xpGranted: { type: Number, default: 0 },
  bonusGranted: { type: Boolean, default: false },
  rewardGrantedAt: { type: Date },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'referrals',
});

ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ refereeId: 1 });
ReferralSchema.index({ referralCode: 1 }, { unique: true });

export const Referral = model<IReferral>('Referral', ReferralSchema);