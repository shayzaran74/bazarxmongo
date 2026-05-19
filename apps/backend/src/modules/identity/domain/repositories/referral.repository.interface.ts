// apps/backend/src/modules/identity/domain/repositories/referral.repository.interface.ts

export interface IReferralRepository {
  findByReferee(refereeId: string): Promise<any | null>;
  findByReferrer(referrerId: string): Promise<any[]>;
  findReverseReferral(referrerId: string, refereeId: string): Promise<any | null>;
  create(data: { referrerId: string; refereeId: string; referralCode: string }): Promise<void>;
  updateRewardGranted(refereeId: string, xpGranted: number, bonusGranted: number): Promise<void>;
}