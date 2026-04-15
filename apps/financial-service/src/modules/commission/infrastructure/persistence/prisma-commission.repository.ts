// apps/financial-service/src/modules/commission/infrastructure/persistence/prisma-commission.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ICommissionRepository } from '../../domain/repositories/commission.repository.interface';
import { CommissionRecord } from '../../domain/entities/commission-record.entity';
import { CommissionMapper } from './mappers/commission.mapper';

@Injectable()
export class PrismaCommissionRepository implements ICommissionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: CommissionMapper,
  ) {}

  async findByOrderId(orderId: string): Promise<CommissionRecord | null> {
    const raw = await this.prisma.commissionRecord.findFirst({
      where: { orderId },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findByVendorId(vendorId: string): Promise<CommissionRecord[]> {
    const raws = await this.prisma.commissionRecord.findMany({
      where: { vendorId },
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async findById(id: string): Promise<CommissionRecord | null> {
    const raw = await this.prisma.commissionRecord.findUnique({
      where: { id },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<CommissionRecord[]> {
    const raws = await this.prisma.commissionRecord.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: CommissionRecord): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    await this.prisma.commissionRecord.upsert({
      where: { id: entity.id },
      update: persistence,
      create: persistence,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.commissionRecord.delete({ where: { id } });
  }
}
