// apps/financial-service/src/modules/escrow/application/commands/create-escrow.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { CreateEscrowCommand } from './create-escrow.command';
import { Escrow } from '../../domain/entities/escrow.entity';
import { Decimal } from 'decimal.js';
import {
  IWallet,
  IFinancialEscrow,
  IFinancialAccount,
  IFinancialAccountTransaction,
  IFinancialGeneralLedger,
} from '@barterborsa/shared-persistence';

const d128 = (v: string | number): Types.Decimal128 =>
  Types.Decimal128.fromString(Number(v).toFixed(2));

@CommandHandler(CreateEscrowCommand)
export class CreateEscrowHandler implements ICommandHandler<CreateEscrowCommand, Escrow> {
  constructor(
    @InjectModel('Escrow') private readonly escrowModel: Model<IFinancialEscrow>,
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectModel('Account') private readonly accountModel: Model<IFinancialAccount>,
    @InjectModel('AccountTransaction') private readonly txModel: Model<IFinancialAccountTransaction>,
    @InjectModel('GeneralLedger') private readonly ledgerModel: Model<IFinancialGeneralLedger>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(command: CreateEscrowCommand): Promise<Escrow> {
    const { orderId, buyerId, sellerId, amount } = command;
    const amountD128 = d128(amount.toFixed(2));

    let result: Escrow | null = null;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        // Mükerrer kontrol
        const existing = await this.escrowModel.findOne({ orderId }).session(session).lean();
        if (existing) {
          result = Escrow.fromPersistence({
            id: existing.id, orderId: existing.orderId, buyerId: existing.buyerId,
            sellerId: existing.sellerId,
            amount: new Decimal(existing.amount.toString()),
            releasedAmount: new Decimal(existing.releasedAmount.toString()),
            status: existing.status, createdAt: existing.createdAt,
            updatedAt: existing.updatedAt, releasedAt: existing.releasedAt ?? null,
            payoutLog: existing.payoutLog,
          });
          return;
        }

        // Bakiye + hesap atomik okuma
        const [wallet, mainAccount] = await Promise.all([
          this.walletModel.findOne({ userId: buyerId }).session(session).lean(),
          this.accountModel.findOne({ userId: buyerId, type: 'MAIN' }).session(session).lean(),
        ]);

        if (!wallet) throw new Error('Kullanıcı cüzdanı bulunamadı.');
        if (!mainAccount) throw new Error('Kullanıcının ana hesabı bulunamadı.');

        const amountDec = new Decimal(amount.toFixed(2));
        if (new Decimal(wallet.balanceTL.toString()).lt(amountDec)) {
          throw new Error('Yetersiz bakiye.');
        }

        // Cüzdan düşüm
        await this.walletModel.updateOne(
          { userId: buyerId },
          { $inc: { balanceTL: d128(-amountDec.toNumber()) } },
          { session },
        );

        // Account senkronizasyonu
        await this.accountModel.updateOne(
          { _id: mainAccount._id ?? mainAccount.id },
          { $inc: { balance: d128(-amountDec.toNumber()), availableBalance: d128(-amountDec.toNumber()) } },
          { session },
        );

        // Escrow oluştur
        const newId = new Types.ObjectId().toString();
        await this.escrowModel.create(
          [{
            _id: newId, id: newId, orderId, buyerId, sellerId,
            amount: amountD128, status: 'FUNDED',
            releasedAmount: d128(0),
            createdAt: new Date(), updatedAt: new Date(),
          }],
          { session },
        );

        // Muhasebe + hesap hareketi
        await Promise.all([
          this.ledgerModel.create(
            [{
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), type: 'DEBIT',
              debitAccountId: buyerId,
              creditAccountId: 'SYSTEM_ESCROW_ACCOUNT',
              amount: amountD128, referenceId: orderId, refType: 'ORDER',
              note: `Order ${orderId} için bakiye rezerve edildi.`,
            }],
            { session },
          ),
          this.txModel.create(
            [{
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(),
              accountId: mainAccount._id ?? mainAccount.id,
              type: 'PAYMENT', direction: 'DEBIT', amount: amountD128,
              description: `Sipariş #${orderId} için ödeme (Emanet)`,
              referenceId: orderId, referenceType: 'ORDER', status: 'COMPLETED',
            }],
            { session },
          ),
        ]);

        result = Escrow.create({ orderId, buyerId, sellerId, amount: amountDec });
      });
    } finally {
      await session.endSession();
    }

    if (!result) throw new Error('Escrow oluşturulamadı.');
    return result;
  }
}
