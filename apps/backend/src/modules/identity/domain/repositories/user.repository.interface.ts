// apps/backend/src/modules/identity/domain/repositories/user.repository.interface.ts

export interface IUserRepository {
  findById(id: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  findByReferralCode(code: string): Promise<any | null>;
  updateRole(userId: string, role: string): Promise<void>;
  updateReferralCode(userId: string, code: string): Promise<void>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
}