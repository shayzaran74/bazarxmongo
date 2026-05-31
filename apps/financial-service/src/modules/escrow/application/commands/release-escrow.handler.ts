// apps/financial-service/src/modules/escrow/application/commands/release-escrow.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { ReleaseEscrowCommand } from './release-escrow.command';
import { Escrow } from '../../domain/entities/escrow.entity';
import { CommissionCalculatorService } from '../../../commission/domain/services/commission-calculator.service';
import { Decimal } from 'decimal.js';
import {
  IWallet,
  IFinancialEscrow,
  IFinancialAccount,
  IFinancialAccountTransaction,
  IFinancialGeneralLedger,
} from '@barterborsa/shared-persistence';

const d128 = (v: number | string): Types.Decimal128 =>
  Types.Decimal128.fromString(new Decimal(v).toFixed(2));

@CommandHandler(ReleaseEscrowCommand)
export class ReleaseEscrowHandler implements ICommandHandler<ReleaseEscrowCommand> {
  constructor(
    @InjectModel('Escrow') private readonly escrowModel: Model<IFinancialEscrow>,
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectModel('Account') private readonly accountModel: Model<IFinancialAccount>,
    @InjectModel('AccountTransaction') private readonly txModel: Model<IFinancialAccountTransaction>,
    @InjectModel('GeneralLedger') private readonly ledgerModel: Model<IFinancialGeneralLedger>,
    @InjectConnection() private readonly connection: Connection,
    private readonly commissionCalculator: CommissionCalculatorService,
  ) {}

  async execute(command: ReleaseEscrowCommand): Promise<void> {
    const { orderId } = command;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const escrow = await this.escrowModel.findOne({ orderId }).session(session).lean();
        if (!escrow) throw new Error(`Escrow kaydı bulunamadı: ${orderId}`);
        if (escrow.status === 'RELEASED') return;
        if (escrow.status !== 'HELD') throw new Error(`Escrow serbest bırakılamaz: ${escrow.status}`);

        const escrowEntity = Escrow.fromPersistence({
          id: escrow.id, orderId: escrow.orderId, buyerId: escrow.buyerId,
          sellerId: escrow.sellerId,
          amount: new Decimal(escrow.amount.toString()),
          releasedAmount: new Decimal(escrow.releasedAmount.toString()),
          status: escrow.status, createdAt: escrow.createdAt,
          updatedAt: escrow.updatedAt, releasedAt: escrow.releasedAt ?? null,
          payoutLog: escrow.payoutLog,
        });
        escrowEntity.release();

        // Satıcı hesabı — yoksa oluştur
        let sellerAccount = await this.accountModel
          .findOne({ userId: escrow.sellerId, type: 'MAIN' })
          .session(session)
          .lean();

        if (!sellerAccount) {
          const ids = [new Types.ObjectId().toString(), new Types.ObjectId().toString(), new Types.ObjectId().toString(), new Types.ObjectId().toString()];
          await this.accountModel.insertMany(
            [
              { _id: ids[0], id: ids[0], userId: escrow.sellerId, type: 'MAIN',    currency: 'TRY',    vendorTier: 'CORE', status: 'ACTIVE', ownerType: 'VENDOR', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
              { _id: ids[1], id: ids[1], userId: escrow.sellerId, type: 'BARTER',  currency: 'BARTER', status: 'ACTIVE', ownerType: 'VENDOR', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
              { _id: ids[2], id: ids[2], userId: escrow.sellerId, type: 'XP_COMMISSION', currency: 'TRY', status: 'ACTIVE', ownerType: 'VENDOR', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
              { _id: ids[3], id: ids[3], userId: escrow.sellerId, type: 'XP_ADS', currency: 'TRY', status: 'ACTIVE', ownerType: 'VENDOR', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
            ],
            { session },
          );
          sellerAccount = await this.accountModel
            .findOne({ userId: escrow.sellerId, type: 'MAIN' })
            .session(session)
            .lean();
        }

        const vendorTier = sellerAccount?.vendorTier || 'CORE';
        const grossAmount = new Decimal(escrow.amount.toString());
        // GO_ORDER escrow'larında otomatik B2B tier komisyonu KESİLMEZ — platform tutarın
        // tamamını alır; GO komisyonu ve restoran hakedişi BazarXGO tarafında hesaplanıp
        // periyodik payout ile aktarılır (bazarxgoplan.md §3.2, Seçenek B).
        const { commission: commissionAmount, rate } = escrow.reason === 'GO_ORDER'
          ? { commission: new Decimal(0), rate: 0 }
          : this.commissionCalculator.calculateSimple(grossAmount, vendorTier);
        const netAmount = grossAmount.sub(commissionAmount);

        // Satıcı cüzdan kredisi
        await this.walletModel.findOneAndUpdate(
          { userId: escrow.sellerId },
          {
            $inc: { balanceTL: d128(netAmount.toFixed(2)) },
            $setOnInsert: {
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), userId: escrow.sellerId,
              barterBalance: d128(0), xpPoints: 0,
              xpAdsBalance: d128(0), xpTradeBalance: d128(0), xpCommissionBalance: d128(0),
            },
          },
          { upsert: true, session },
        );

        // Platform komisyon cüzdanı
        await this.walletModel.findOneAndUpdate(
          { userId: 'SYSTEM_PLATFORM_ACCOUNT' },
          {
            $inc: { balanceTL: d128(commissionAmount.toFixed(2)) },
            $setOnInsert: {
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), userId: 'SYSTEM_PLATFORM_ACCOUNT',
              barterBalance: d128(0), xpPoints: 0,
              xpAdsBalance: d128(0), xpTradeBalance: d128(0), xpCommissionBalance: d128(0),
            },
          },
          { upsert: true, session },
        );

        // Escrow durumu güncelle
        await this.escrowModel.updateOne(
          { orderId },
          {
            $set: {
              status: 'RELEASED',
              releasedAt: escrowEntity.releasedAt,
              releasedAmount: d128(netAmount.toFixed(2)),
              updatedAt: escrowEntity.updatedAt,
              payoutLog: { grossAmount: grossAmount.toFixed(2), commissionAmount: commissionAmount.toFixed(2), netAmount: netAmount.toFixed(2), vendorTier, commissionRate: rate },
            },
          },
          { session },
        );

        // Muhasebe kayıtları
        await this.ledgerModel.create(
          [
            { _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), type: 'DEBIT', debitAccountId: 'SYSTEM_ESCROW_ACCOUNT', creditAccountId: escrow.sellerId, amount: d128(grossAmount.toFixed(2)), referenceId: orderId, refType: 'ORDER', note: `Order ${orderId} emanet çözüldü (Brüt: ${grossAmount.toFixed(2)})` },
            ...(commissionAmount.gt(0) ? [{ _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), type: 'DEBIT', debitAccountId: escrow.sellerId, creditAccountId: 'SYSTEM_PLATFORM_ACCOUNT', amount: d128(commissionAmount.toFixed(2)), referenceId: orderId, refType: 'ORDER', note: `Order ${orderId} komisyon kesintisi (%${rate})` }] : []),
          ],
          { session },
        );

        if (sellerAccount) {
          await Promise.all([
            this.txModel.create(
              [{
                _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(),
                accountId: sellerAccount._id ?? sellerAccount.id,
                type: 'RELEASE', direction: 'CREDIT', amount: d128(netAmount.toFixed(2)),
                description: `Sipariş #${orderId} ödemesi (Komisyon: ${commissionAmount.toFixed(2)})`,
                referenceId: orderId, referenceType: 'ORDER', status: 'COMPLETED',
              }],
              { session },
            ),
            this.accountModel.updateOne(
              { _id: sellerAccount._id ?? sellerAccount.id },
              { $inc: { balance: d128(netAmount.toFixed(2)), availableBalance: d128(netAmount.toFixed(2)) } },
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
