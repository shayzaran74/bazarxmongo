// apps/financial-service/src/modules/wallet/application/commands/approve-topup.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { ApproveTopUpCommand } from './approve-topup.command';
import { NotFoundException } from '@barterborsa/shared-core';
import {
  IWallet,
  IFinancialAccount,
  IFinancialAccountTransaction,
  IFinancialGeneralLedger,
  IFinancialAccountTopUpRequest,
} from '@barterborsa/shared-persistence';

const d128 = (v: string | number): Types.Decimal128 =>
  Types.Decimal128.fromString(Number(v).toFixed(2));

@CommandHandler(ApproveTopUpCommand)
export class ApproveTopUpHandler implements ICommandHandler<ApproveTopUpCommand> {
  constructor(
    @InjectModel('AccountTopUpRequest') private readonly topUpModel: Model<IFinancialAccountTopUpRequest>,
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectModel('Account') private readonly accountModel: Model<IFinancialAccount>,
    @InjectModel('AccountTransaction') private readonly txModel: Model<IFinancialAccountTransaction>,
    @InjectModel('GeneralLedger') private readonly ledgerModel: Model<IFinancialGeneralLedger>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(command: ApproveTopUpCommand): Promise<void> {
    const { requestId, adminId } = command;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const request = await this.topUpModel
          .findById(requestId)
          .session(session)
          .lean();

        if (!request) throw new NotFoundException(`Top-up isteği bulunamadı: ${requestId}`);
        if (request.status !== 'PENDING') throw new Error(`İstek zaten işlenmiş: ${request.status}`);

        const amt = d128(request.amount.toString());

        // İstek durumunu onayla
        await this.topUpModel.updateOne(
          { _id: requestId },
          { $set: { status: 'APPROVED', processedAt: new Date(), processedBy: adminId } },
          { session },
        );

        // Cüzdana bakiye ekle
        await this.walletModel.findOneAndUpdate(
          { userId: request.userId },
          {
            $inc: { balanceTL: amt },
            $setOnInsert: {
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), userId: request.userId,
              barterBalance: d128(0), xpPoints: 0,
              xpAdsBalance: d128(0), xpTradeBalance: d128(0), xpCommissionBalance: d128(0),
            },
          },
          { upsert: true, session },
        );

        // MAIN hesabı güncelle
        const mainAccount = await this.accountModel
          .findOneAndUpdate(
            { userId: request.userId, type: 'MAIN' },
            { $inc: { balance: amt, availableBalance: amt } },
            { new: true, session },
          )
          .lean();

        if (mainAccount) {
          await this.txModel.create(
            [{
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(),
              accountId:     mainAccount._id ?? mainAccount.id,
              type:          'TOPUP',
              direction:     'CREDIT',
              amount:        amt,
              status:        'COMPLETED',
              description:   'Banka transferi ile bakiye yükleme (Onaylandı)',
              referenceId:   requestId,
              referenceType: 'TOPUP_REQUEST',
            }],
            { session },
          );
        }

        await this.ledgerModel.create(
          [{
            _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(),
            type:            'CREDIT',
            debitAccountId:  'SYSTEM_BANK_ACCOUNT',
            creditAccountId: request.userId,
            amount:          amt,
            referenceId:     `APPROVE-${requestId}`,
            refType:         'TOPUP',
            note:            `Admin onaylı bakiye yükleme (İstek: ${requestId}, Admin: ${adminId})`,
          }],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
  }
}
