// apps/financial-service/src/modules/escrow/infrastructure/persistence/prisma-escrow.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IEscrowRepository } from '../../domain/repositories/escrow.repository.interface';
import { Escrow } from '../../domain/entities/escrow.entity';
import { EscrowMapper } from './mappers/escrow.mapper';

@Injectable()
export class PrismaEscrowRepository implements IEscrowRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: EscrowMapper,
  ) {}

  async findByOrderId(orderId: string): Promise<Escrow | null> {
    const raw = await this.prisma.escrow.findUnique({
      where: { orderId },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findActiveByBuyerId(buyerId: string): Promise<Escrow[]> {
    const raws = await this.prisma.escrow.findMany({
      where: { 
        buyerId,
        status: { in: ['PENDING', 'FUNDED', 'DISPUTED'] }
      },
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async findById(id: string): Promise<Escrow | null> {
    const raw = await this.prisma.escrow.findUnique({
      where: { id },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Escrow[]> {
    const raws = await this.prisma.escrow.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: Escrow): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    await this.prisma.escrow.upsert({
      where: { orderId: entity.orderId },
      update: persistence,
      create: persistence,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.escrow.delete({ where: { id } });
  }
}
