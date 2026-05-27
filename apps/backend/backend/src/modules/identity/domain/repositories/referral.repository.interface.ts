// apps/backend/src/modules/identity/domain/repositories/referral.repository.interface.ts

export interface ReferralRecord {
  referrerId:       string;
  refereeId:        string;
  referralCode:     string;
  xpGranted?:       number;
  bonusGranted?:    boolean;
  rewardGrantedAt?: Date | null;
  createdAt?:       Date;
}

export interface IReferralRepository {
  findByReferee(refereeId: string): Promise<ReferralRecord | null>;
  findByReferrer(referrerId: string): Promise<ReferralRecord[]>;
  findReverseReferral(referrerId: string, refereeId: string): Promise<ReferralRecord | null>;
  create(data: { referrerId: string; refereeId: string; referralCode: string }): Promise<void>;
  updateRewardGranted(refereeId: string, xpGranted: number, bonusGranted: number): Promise<void>;
}