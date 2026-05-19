// apps/financial-service/src/modules/wallet/infrastructure/persistence/mongo-wallet.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { IWallet } from '@barterborsa/shared-persistence';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
import { Wallet } from '../../domain/entities/wallet.entity';
import { WalletMapper } from './mappers/wallet.mapper';

const d128 = (n: number): Types.Decimal128 =>
  Types.Decimal128.fromString(n.toFixed(2));

@Injectable()
export class MongoWalletRepository implements IWalletRepository {
  constructor(
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectConnection() private readonly connection: Connection,
    private readonly mapper: WalletMapper,
  ) {}

  async findByUserId(userId: string): Promise<Wallet | null> {
    const raw = await this.walletModel.findOne({ userId }).lean();
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findById(id: string): Promise<Wallet | null> {
    const raw = await this.walletModel.findById(id).lean();
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Wallet[]> {
    const raws = await this.walletModel.find().lean();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: Wallet): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const current = await this.walletModel
          .findOne({ userId: entity.userId })
          .session(session)
          .lean();

        if (!current) {
          await this.walletModel.create(
            [{ _id: entity.id, id: entity.id, ...persistence }],
            { session },
          );
          return;
        }

        // Fark bazlı atomik güncelleme — eş zamanlı yazma güvenliği
        const diff = (a: Types.Decimal128, b: Types.Decimal128) =>
          d128(parseFloat(a.toString()) - parseFloat(b.toString()));

        await this.walletModel.updateOne(
          { userId: entity.userId },
          {
            $inc: {
              balanceTL:           diff(persistence.balanceTL!, current.balanceTL),
              barterBalance:       diff(persistence.barterBalance!, current.barterBalance),
              xpPoints:            entity.xpPoints - current.xpPoints,
              xpAdsBalance:        diff(persistence.xpAdsBalance!, current.xpAdsBalance),
              xpTradeBalance:      diff(persistence.xpTradeBalance!, current.xpTradeBalance),
              xpCommissionBalance: diff(persistence.xpCommissionBalance!, current.xpCommissionBalance),
            },
            $set: { lastXpAdsEarnedDate: persistence.lastXpAdsEarnedDate ?? null },
          },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }

  async delete(id: string): Promise<void> {
    await this.walletModel.deleteOne({ _id: id });
  }
}
