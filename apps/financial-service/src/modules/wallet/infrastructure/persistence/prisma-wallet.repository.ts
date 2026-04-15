// apps/financial-service/src/modules/wallet/infrastructure/persistence/prisma-wallet.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
import { Wallet } from '../../domain/entities/wallet.entity';
import { WalletMapper } from './mappers/wallet.mapper';

@Injectable()
export class PrismaWalletRepository implements IWalletRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: WalletMapper,
  ) {}

  async findByUserId(userId: string): Promise<Wallet | null> {
    const raw = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findById(id: string): Promise<Wallet | null> {
    const raw = await this.prisma.wallet.findUnique({
      where: { id },
    });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Wallet[]> {
    const raws = await this.prisma.wallet.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: Wallet): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    await this.prisma.wallet.upsert({
      where: { userId: entity.userId },
      update: persistence,
      create: persistence,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wallet.delete({ where: { id } });
  }
}
