// apps/financial-service/src/modules/escrow/application/commands/refund-escrow.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { RefundEscrowCommand } from './refund-escrow.command';
import { Escrow } from '../../domain/entities/escrow.entity';
import { Decimal } from 'decimal.js';
import {
  IWallet,
  IFinancialEscrow,
  IFinancialAccount,
  IFinancialAccountTransaction,
  IFinancialGeneralLedger,
} from '@barterborsa/shared-persistence';

const d128 = (v: number | string): Types.Decimal128 =>
  Types.Decimal128.fromString(Number(v).toFixed(2));

@CommandHandler(RefundEscrowCommand)
export class RefundEscrowHandler implements ICommandHandler<RefundEscrowCommand> {
  constructor(
    @InjectModel('Escrow') private readonly escrowModel: Model<IFinancialEscrow>,
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectModel('Account') private readonly accountModel: Model<IFinancialAccount>,
    @InjectModel('AccountTransaction') private readonly txModel: Model<IFinancialAccountTransaction>,
    @InjectModel('GeneralLedger') private readonly ledgerModel: Model<IFinancialGeneralLedger>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(command: RefundEscrowCommand): Promise<void> {
    const { orderId, reason } = command;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const escrow = await this.escrowModel.findOne({ orderId }).session(session).lean();
        if (!escrow) throw new Error(`Escrow kaydı bulunamadı: ${orderId}`);
        if (escrow.status === 'REFUNDED') return;
        if (escrow.status !== 'HELD') throw new Error(`Escrow iade edilemez: ${escrow.status}`);

        const escrowEntity = Escrow.fromPersistence({
          id: escrow.id, orderId: escrow.orderId, buyerId: escrow.buyerId,
          sellerId: escrow.sellerId,
          amount: new Decimal(escrow.amount.toString()),
          releasedAmount: new Decimal(escrow.releasedAmount.toString()),
          status: escrow.status, createdAt: escrow.createdAt,
          updatedAt: escrow.updatedAt, releasedAt: escrow.releasedAt ?? null,
          payoutLog: escrow.payoutLog,
        });
        escrowEntity.refund();

        const buyerWallet = await this.walletModel
          .findOne({ userId: escrow.buyerId })
          .session(session)
          .lean();
        if (!buyerWallet) throw new Error(`Alıcı cüzdanı bulunamadı: ${escrow.buyerId}`);

        // Alıcı hesabı — yoksa oluştur
        let buyerAccount = await this.accountModel
          .findOne({ userId: escrow.buyerId, type: 'MAIN' })
          .session(session)
          .lean();

        if (!buyerAccount) {
          const ids = [new Types.ObjectId().toString(), new Types.ObjectId().toString(), new Types.ObjectId().toString(), new Types.ObjectId().toString()];
          await this.accountModel.insertMany(
            [
              { _id: ids[0], id: ids[0], userId: escrow.buyerId, type: 'MAIN',    currency: 'TRY',    status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
              { _id: ids[1], id: ids[1], userId: escrow.buyerId, type: 'BARTER',  currency: 'BARTER', status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
              { _id: ids[2], id: ids[2], userId: escrow.buyerId, type: 'XP_COMMISSION', currency: 'TRY', status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
              { _id: ids[3], id: ids[3], userId: escrow.buyerId, type: 'XP_ADS', currency: 'TRY', status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
            ],
            { session },
          );
          buyerAccount = await this.accountModel
            .findOne({ userId: escrow.buyerId, type: 'MAIN' })
            .session(session)
            .lean();
        }

        const amt = d128(escrow.amount.toString());

        // Cüzdan iadesi
        await this.walletModel.updateOne(
          { userId: escrow.buyerId },
          { $inc: { balanceTL: amt } },
          { session },
        );

        // Escrow durumu güncelle
        await this.escrowModel.updateOne(
          { orderId },
          { $set: { status: 'REFUNDED', updatedAt: escrowEntity.updatedAt } },
          { session },
        );

        // Muhasebe kaydı
        await this.ledgerModel.create(
          [{
            _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), type: 'CREDIT',
            debitAccountId:  'SYSTEM_ESCROW_ACCOUNT',
            creditAccountId: escrow.buyerId,
            amount:          amt,
            referenceId:     orderId, refType: 'ORDER',
            note:            `Order ${orderId} iadesi alıcıya aktarıldı. Sebep: ${reason || 'İptal'}`,
          }],
          { session },
        );

        if (buyerAccount) {
          await Promise.all([
            this.txModel.create(
              [{
                _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(),
                accountId: buyerAccount._id ?? buyerAccount.id,
                type: 'REFUND', direction: 'CREDIT', amount: amt,
                description: `İade: Sipariş #${orderId} tutarı cüzdanınıza geri yüklendi.`,
                referenceId: orderId, referenceType: 'ORDER', status: 'COMPLETED',
              }],
              { session },
            ),
            this.accountModel.updateOne(
              { _id: buyerAccount._id ?? buyerAccount.id },
              { $inc: { balance: amt, availableBalance: amt } },
              { session },
            ),
          ]);
        }
      });
    } finally {
      await session.endSession();
    }
  }
}
