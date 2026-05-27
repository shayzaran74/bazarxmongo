// apps/backend/src/modules/identity/domain/repositories/user.repository.interface.ts

export interface UserIdentity {
  id: string;
  email: string;
  role?: string;
  referralCode?: string;
  profile?: { firstName?: string; lastName?: string };
  firstName?: string;
  lastName?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserIdentity | null>;
  findByEmail(email: string): Promise<UserIdentity | null>;
  findByReferralCode(code: string): Promise<UserIdentity | null>;
  updateRole(userId: string, role: string): Promise<void>;
  updateReferralCode(userId: string, code: string): Promise<void>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
}