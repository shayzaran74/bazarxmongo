// apps/backend/src/modules/barter/domain/repositories/user-level.repository.interface.ts

export interface IUserLevelRepository {
  resetXp(userId: string): Promise<void>;
  findByUserId(userId: string): Promise<{ userId: string; currentXp: number } | null>;
  decrementXp(userId: string, amount: number): Promise<void>;
}