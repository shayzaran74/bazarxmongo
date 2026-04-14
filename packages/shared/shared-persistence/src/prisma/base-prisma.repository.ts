// packages/shared/shared-persistence/src/prisma/base-prisma.repository.ts

import { PrismaService } from './prisma.service';

export abstract class BasePrismaRepository<TDomain, TPrismaModel> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string
  ) {}

  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  async findById(id: string): Promise<TDomain | null> {
    const record = await this.model.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<TDomain[]> {
    const records = await this.model.findMany();
    return records.map((r: TPrismaModel) => this.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({
      where: { id },
    });
  }

  /**
   * Prisma modelini Domain modeline dönüştürür.
   * Alt sınıflar tarafından implement edilmelidir.
   */
  protected abstract toDomain(record: TPrismaModel): TDomain;

  /**
   * Domain modelini Prisma modeline/inputuna dönüştürür.
   * Alt sınıflar tarafından implement edilmelidir.
   */
  protected abstract toPersistence(entity: TDomain): any;
}
