// apps/financial-service/src/modules/wallet/application/commands/topup-wallet.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { TopUpWalletCommand } from './topup-wallet.command';
import {
  IWallet,
  IFinancialAccount,
  IFinancialAccountTransaction,
  IFinancialGeneralLedger,
} from '@barterborsa/shared-persistence';

import { Decimal } from 'decimal.js';

// Number(v) float precision kaybı yaratır; Decimal.js üzerinden dönüştür
const d128 = (v: number | string): Types.Decimal128 =>
  Types.Decimal128.fromString(new Decimal(v).toFixed(2));

@CommandHandler(TopUpWalletCommand)
export class TopUpWalletHandler implements ICommandHandler<TopUpWalletCommand> {
  constructor(
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectModel('Account') private readonly accountModel: Model<IFinancialAccount>,
    @InjectModel('AccountTransaction') private readonly txModel: Model<IFinancialAccountTransaction>,
    @InjectModel('GeneralLedger') private readonly ledgerModel: Model<IFinancialGeneralLedger>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(command: TopUpWalletCommand): Promise<void> {
    const { userId, amount, currency, idempotencyKey } = command;

    if (!amount.isPositive()) throw new Error('Yükleme tutarı sıfırdan büyük olmalıdır.');
    if (currency !== 'TRY') throw new Error(`${currency} için bakiye yükleme desteklenmiyor.`);

    const referenceId = idempotencyKey || `topup-${Date.now()}`;
    const amountD128  = d128(amount.toFixed(2));

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        // Mükerrer kontrol
        const existing = await this.ledgerModel
          .findOne({ referenceId, refType: 'TOPUP' })
          .session(session)
          .lean();
        if (existing) return;

        // Cüzdan güncelle / oluştur
        await this.walletModel.findOneAndUpdate(
          { userId },
          {
            $inc: { balanceTL: amountD128 },
            $setOnInsert: {
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), userId,
              barterBalance: d128(0), xpPoints: 0,
              xpAdsBalance: d128(0), xpTradeBalance: d128(0),
              xpCommissionBalance: d128(0),
            },
          },
          { upsert: true, session },
        );

        // Account senkronizasyonu
        const mainAccount = await this.accountModel.findOneAndUpdate(
          { userId, type: 'MAIN' },
          {
            $inc: { balance: amountD128, availableBalance: amountD128 },
            $setOnInsert: {
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), userId, type: 'MAIN',
              currency: 'TRY', status: 'ACTIVE', ownerType: 'CUSTOMER',
              blockedBalance: d128(0), creditLimit: d128(0), isDirty: true,
            },
          },
          { upsert: true, new: true, session },
        ).lean();

        // Hesap hareketi
        if (mainAccount) {
          await this.txModel.create(
            [{
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(),
              accountId:     mainAccount._id ?? mainAccount.id,
              type:          'TOPUP',
              direction:     'CREDIT',
              amount:        amountD128,
              status:        'COMPLETED',
              description:   `Cüzdan bakiye yükleme (${currency})`,
              referenceId,
              referenceType: 'TOPUP',
            }],
            { session },
          );
        }

        // Muhasebe kaydı
        await this.ledgerModel.create(
          [{
            _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(),
            type:            'CREDIT',
            debitAccountId:  'SYSTEM_BANK_ACCOUNT',
            creditAccountId: userId,
            amount:          amountD128,
            referenceId,
            refType:         'TOPUP',
            note:            `Cüzdan bakiye yükleme (${currency})`,
          }],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }
}
