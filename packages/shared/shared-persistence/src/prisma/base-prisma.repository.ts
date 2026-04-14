// packages/shared/shared-persistence/src/prisma/base-prisma.repository.ts

import { PrismaService } from './prisma.service';

/**
 * Prisma modelleri için ortak metodları içeren interface.
 * 'any' kullanımını önlemek için tanımlanmıştır.
 */
interface GenericPrismaModel {
  findUnique(args: unknown): Promise<unknown>;
  findMany(args?: unknown): Promise<unknown[]>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
  count(args?: unknown): Promise<number>;
  upsert(args: unknown): Promise<unknown>;
}

export abstract class BasePrismaRepository<TDomain, TPrismaModel> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string
  ) {}

  protected get model(): GenericPrismaModel {
    return (this.prisma as unknown as Record<string, GenericPrismaModel>)[this.modelName];
  }

  async findById(id: string): Promise<TDomain | null> {
    const record = await this.model.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record as TPrismaModel) : null;
  }

  async findAll(): Promise<TDomain[]> {
    const records = await this.model.findMany();
    return (records as TPrismaModel[]).map((r: TPrismaModel) => this.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({
      where: { id },
    });
  }

  /**
   * Prisma modelini Domain modeline dönüştürür.
   */
  protected abstract toDomain(record: TPrismaModel): TDomain;

  /**
   * Domain modelini Prisma modeline/inputuna dönüştürür.
   */
  protected abstract toPersistence(entity: TDomain): unknown;
}
