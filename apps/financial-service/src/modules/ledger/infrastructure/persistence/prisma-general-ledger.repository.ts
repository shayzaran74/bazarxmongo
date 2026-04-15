// apps/financial-service/src/modules/ledger/infrastructure/persistence/prisma-general-ledger.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IGeneralLedgerRepository } from '../../domain/repositories/general-ledger.repository.interface';
import { GeneralLedgerEntry } from '../../domain/entities/general-ledger-entry.entity';
import { LedgerMapper } from './mappers/ledger.mapper';

@Injectable()
export class PrismaGeneralLedgerRepository implements IGeneralLedgerRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: LedgerMapper,
  ) {}

  async findByReferenceId(referenceId: string): Promise<GeneralLedgerEntry[]> {
    const raws = await this.prisma.generalLedger.findMany({
      where: { referenceId },
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async findById(id: string): Promise<GeneralLedgerEntry | null> {
    const raw = await this.prisma.generalLedger.findFirst({
      where: { id },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<GeneralLedgerEntry[]> {
    const raws = await this.prisma.generalLedger.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: GeneralLedgerEntry): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    await this.prisma.generalLedger.create({
      data: persistence,
    });
  }

  async delete(id: string): Promise<void> {
    // Ledger is immutable, delete might not be allowed in production
    await this.prisma.generalLedger.delete({ where: { id_createdAt: { id, createdAt: new Date() } } });
    // Note: Primary key was @id([id, createdAt]) in schema
  }
}
// Fix: schema.prisma primary key has id and createdAt. 
// I'll adjust the schema if needed or fix delete method.
