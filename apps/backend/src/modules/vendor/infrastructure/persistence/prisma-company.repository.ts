// apps/backend/src/modules/vendor/infrastructure/persistence/prisma-company.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Company } from '../../domain/entities/company.entity';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { CompanyMapper } from './mappers/company.mapper';
import { TaxNumber } from '../../domain/value-objects/tax-number.vo';

@Injectable()
export class PrismaCompanyRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({
      where: { id, deletedAt: null },
    });
    return record ? CompanyMapper.toDomain(record) : null;
  }

  async findByTaxNumber(taxNumber: TaxNumber): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({
      where: { taxNumber: taxNumber.value, deletedAt: null },
    });
    return record ? CompanyMapper.toDomain(record) : null;
  }

  async existsByTaxNumber(taxNumber: TaxNumber): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { taxNumber: taxNumber.value, deletedAt: null },
    });
    return count > 0;
  }

  async save(company: Company): Promise<void> {
    const data = CompanyMapper.toPersistence(company);
    await this.prisma.company.upsert({
      where: { id: company.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(): Promise<Company[]> {
    const records = await this.prisma.company.findMany({
      where: { deletedAt: null },
    });
    return records.map(r => CompanyMapper.toDomain(r));
  }
}
