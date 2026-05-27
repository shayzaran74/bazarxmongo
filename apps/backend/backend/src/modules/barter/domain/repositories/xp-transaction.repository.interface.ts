// apps/backend/src/modules/barter/domain/repositories/xp-transaction.repository.interface.ts

export interface IXpTransactionRepository {
  updateExpiresAtByUserAndTypes(
    userId: string,
    types: string[],
    expiresAt: Date,
  ): Promise<void>;
  updateExpiresAtByUserAndNotTypes(
    userId: string,
    excludeTypes: string[],
    expiresAt: Date,
  ): Promise<void>;
  findFirstByUserIdAndType(
    userId: string,
    type: string,
    createdBefore: Date,
  ): Promise<{ id: string; userId: string; type: string } | null>;
  create(data: {
    userId: string;
    amount: number;
    type: string;
    description?: string;
    referenceId?: string;
    referenceType?: string;
    expiresAt?: Date;
  }): Promise<void>;
}