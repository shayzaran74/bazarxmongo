// apps/financial-service/src/modules/wallet/presentation/wallet.grpc.controller.ts

import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Decimal } from 'decimal.js';

import { GetBalanceQuery }      from '../application/queries/get-balance.query';
import { GetTransactionsQuery } from '../application/queries/get-transactions.query';
import { TopUpWalletCommand }   from '../application/commands/topup-wallet.command';
import { ApproveTopUpCommand }  from '../application/commands/approve-topup.command';
import { RejectTopUpCommand }   from '../application/commands/reject-topup.command';
import { Wallet }               from '../domain/entities/wallet.entity';
import { IWalletRepository }    from '../domain/repositories/wallet.repository.interface';

import {
  IWallet,
  IFinancialAccount,
  IFinancialAccountTransaction,
  IFinancialAccountTopUpRequest,
  IFinancialAccountWithdrawalRequest,
  IFinancialGiftCard,
  TopUpRequestStatusType,
  WithdrawalRequestStatusType,
  TopUpPaymentMethodType,
} from '@barterborsa/shared-persistence';

const d128 = (v: number | string): Types.Decimal128 =>
  Types.Decimal128.fromString(new Decimal(v).toFixed(2));

function extractError(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen hata oluştu.';
}

@Controller()
export class WalletGrpcController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @Inject('IWalletRepository') private readonly walletRepository: IWalletRepository,
    @InjectModel('Wallet') private readonly walletModel: Model<IWallet>,
    @InjectModel('Account') private readonly accountModel: Model<IFinancialAccount>,
    @InjectModel('AccountTransaction') private readonly txModel: Model<IFinancialAccountTransaction>,
    @InjectModel('AccountTopUpRequest') private readonly topUpModel: Model<IFinancialAccountTopUpRequest>,
    @InjectModel('AccountWithdrawalRequest') private readonly withdrawalModel: Model<IFinancialAccountWithdrawalRequest>,
    @InjectModel('GiftCard') private readonly giftCardModel: Model<IFinancialGiftCard>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @GrpcMethod('FinancialService', 'GetTransactions')
  async getTransactions(data: {
    userId: string;
    accountType?: string;
    page?: number;
    limit?: number;
    accountId?: string;
  }) {
    return this.queryBus.execute(
      new GetTransactionsQuery(data.userId, data.accountType, data.page || 1, data.limit || 20, data.accountId),
    );
  }

  @GrpcMethod('FinancialService', 'ProcessWalletRequest')
  async processWalletRequest(data: { requestId: string; action: string; adminId: string; reason?: string }) {
    try {
      if (data.action === 'approve') {
        await this.commandBus.execute(new ApproveTopUpCommand(data.requestId, data.adminId));
      } else {
        await this.commandBus.execute(new RejectTopUpCommand(data.requestId, data.adminId, data.reason || ''));
      }
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'GetWallet')
  async getWallet(data: { userId: string }) {
    // Cüzdan entity'si — bakiye için kaynak
    let walletEntity = await this.walletRepository.findByUserId(data.userId);
    if (!walletEntity) {
      walletEntity = Wallet.create(data.userId);
      await this.walletRepository.save(walletEntity);
    }

    // Account kayıtları — yoksa varsayılan hesapları oluştur
    let accounts = await this.accountModel.find({ userId: data.userId }).lean();
    if (accounts.length === 0) {
      const ids = [new Types.ObjectId().toString(), new Types.ObjectId().toString(), new Types.ObjectId().toString(), new Types.ObjectId().toString()];
      await this.accountModel.insertMany([
        { _id: ids[0], id: ids[0], userId: data.userId, type: 'MAIN',         currency: 'TRY',    status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
        { _id: ids[1], id: ids[1], userId: data.userId, type: 'BARTER',       currency: 'BARTER', status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
        { _id: ids[2], id: ids[2], userId: data.userId, type: 'XP_COMMISSION',currency: 'TRY',    status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
        { _id: ids[3], id: ids[3], userId: data.userId, type: 'XP_ADS',       currency: 'TRY',    status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true },
      ]);
      accounts = await this.accountModel.find({ userId: data.userId }).lean();
    }

    const [topupRequests, withdrawalRequests, giftCards] = await Promise.all([
      this.topUpModel.find({ userId: data.userId }).sort({ createdAt: -1 }).limit(10).lean(),
      this.withdrawalModel.find({ userId: data.userId }).sort({ createdAt: -1 }).limit(10).lean(),
      this.giftCardModel.find({ customerId: data.userId }).sort({ createdAt: -1 }).lean(),
    ]);

    return {
      accounts: accounts.map(acc => {
        let balance   = acc.balance.toString();
        let available = acc.availableBalance.toString();
        if (acc.type === 'MAIN') {
          balance   = walletEntity!.balanceTL.amount.toString();
          available = walletEntity!.balanceTL.amount.minus(new Decimal(acc.blockedBalance.toString())).toString();
        } else if (acc.type === 'BARTER') {
          balance   = walletEntity!.barterBalance.amount.toString();
          available = walletEntity!.barterBalance.amount.minus(new Decimal(acc.blockedBalance.toString())).toString();
        }
        return { id: acc._id ?? acc.id, type: acc.type, balance, availableBalance: available, blockedBalance: acc.blockedBalance.toString(), currency: acc.currency ?? 'TRY' };
      }),
      requests: topupRequests.map(req => ({
        id: req._id ?? req.id, userId: req.userId, type: 'TOPUP',
        amount: req.amount.toString(), status: req.status,
        createdAt: req.createdAt.toISOString(),
      })),
      withdrawalRequests: withdrawalRequests.map(req => ({
        id: req._id ?? req.id, userId: req.userId,
        amount: req.amount.toString(), status: req.status,
        iban: req.iban, accountHolder: req.accountHolder, bankName: req.bankName,
        createdAt: req.createdAt.toISOString(),
        processedAt: req.processedAt ? req.processedAt.toISOString() : '',
        rejectionReason: req.rejectionReason || '',
      })),
      giftCards: giftCards.map(g => ({
        id: g._id ?? g.id, code: g.code,
        initialValue: g.initialValue.toString(), currentValue: g.currentValue.toString(),
        status: g.status, expiresAt: g.expiresAt ? g.expiresAt.toISOString() : '',
        customerId: g.customerId || '', note: g.note || '', createdAt: g.createdAt.toISOString(),
      })),
    };
  }

  @GrpcMethod('FinancialService', 'GetBalance')
  async getBalance(data: { userId: string; accountType: string }) {
    const result = await this.queryBus.execute(new GetBalanceQuery(data.userId, data.accountType));
    return {
      balance:          result.balance.toString(),
      availableBalance: result.availableBalance.toString(),
      blockedBalance:   result.blockedBalance.toString(),
    };
  }

  @GrpcMethod('FinancialService', 'TopUpWallet')
  async topUpWallet(data: { userId: string; amount: string; paymentMethod: string; idempotencyKey: string }) {
    const amount = new Decimal(data.amount);
    if (!amount.isPositive()) return { success: false, error: 'Yükleme tutarı sıfırdan büyük olmalıdır.' };

    if (data.paymentMethod === 'BANK_TRANSFER' || data.paymentMethod === 'EFT') {
      const newId = new Types.ObjectId().toString();
      await this.topUpModel.create([{
        _id: newId, id: newId, userId: data.userId,
        amount: d128(amount.toFixed(2)),
        paymentMethod: data.paymentMethod as TopUpPaymentMethodType,
        status: 'PENDING',
        notes: `${data.paymentMethod} ile yükleme isteği`,
      }]);
      return { success: true, data: { requestId: newId } };
    }

    try {
      await this.commandBus.execute(
        new TopUpWalletCommand(data.userId, amount, 'TRY', data.idempotencyKey || `CC-${Date.now()}`),
      );
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'GetWalletRequests')
  async getWalletRequests(data: { userId?: string; status?: string; page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: { userId?: string; status?: TopUpRequestStatusType } = {};
    if (data.userId?.trim()) where.userId = data.userId;
    if (data.status?.trim()) where.status = data.status as TopUpRequestStatusType;

    const [items, total] = await Promise.all([
      this.topUpModel.find(where).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.topUpModel.countDocuments(where),
    ]);

    return {
      items: items.map(item => ({
        id: item._id ?? item.id, userId: item.userId, type: 'TOPUP',
        amount: item.amount.toString(), status: item.status,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }

  @GrpcMethod('FinancialService', 'GetWithdrawals')
  async getWithdrawals(data: { userId?: string; status?: string; page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: { userId?: string; status?: WithdrawalRequestStatusType } = {};
    if (data.userId?.trim()) where.userId = data.userId;
    if (data.status?.trim()) where.status = data.status as WithdrawalRequestStatusType;

    const [items, total] = await Promise.all([
      this.withdrawalModel.find(where).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.withdrawalModel.countDocuments(where),
    ]);

    return {
      items: items.map(item => ({
        id: item._id ?? item.id, userId: item.userId,
        amount: item.amount.toString(), status: item.status,
        iban: item.iban, accountHolder: item.accountHolder, bankName: item.bankName,
        createdAt: item.createdAt.toISOString(),
        processedAt: item.processedAt ? item.processedAt.toISOString() : '',
        rejectionReason: item.rejectionReason || '',
      })),
      total,
    };
  }

  @GrpcMethod('FinancialService', 'RequestWithdrawal')
  async requestWithdrawal(data: { userId: string; amount: string; iban: string; accountHolder: string; bankName: string; idempotencyKey?: string }) {
    try {
      const amount = new Decimal(data.amount);
      if (!amount.isPositive()) return { success: false, error: 'Çekim tutarı sıfırdan büyük olmalıdır.' };

      const session = await this.connection.startSession();
      let withdrawalId: string;
      try {
        await session.withTransaction(async () => {
          const [wallet, mainAccount] = await Promise.all([
            this.walletModel.findOne({ userId: data.userId }).session(session).lean(),
            this.accountModel.findOne({ userId: data.userId, type: 'MAIN' }).session(session).lean(),
          ]);

          if (!wallet || !mainAccount) throw new Error('Cüzdan veya hesap bulunamadı.');
          if (new Decimal(mainAccount.availableBalance.toString()).lt(amount)) throw new Error('Yetersiz bakiye.');

          const newId = new Types.ObjectId().toString();
          withdrawalId = newId;
          await this.withdrawalModel.create(
            [{ _id: newId, id: newId, userId: data.userId, amount: d128(amount.toFixed(2)), iban: data.iban, accountHolder: data.accountHolder, bankName: data.bankName, status: 'PENDING' }],
            { session },
          );

          await this.accountModel.updateOne(
            { _id: mainAccount._id ?? mainAccount.id },
            { $inc: { availableBalance: d128(-amount.toNumber()), blockedBalance: d128(amount.toNumber()) } },
            { session },
          );

          await this.txModel.create(
            [{
              _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(),
              accountId: mainAccount._id ?? mainAccount.id,
              amount: d128(amount.toFixed(2)), type: 'WITHDRAWAL', direction: 'DEBIT', status: 'PENDING',
              description: `${data.bankName} - ${data.iban} hesabına çekim talebi`,
              referenceId: newId, referenceType: 'WITHDRAWAL_REQUEST',
            }],
            { session },
          );
        });
      } finally {
        await session.endSession();
      }

      return { success: true, withdrawalId: withdrawalId! };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'ProcessWithdrawal')
  async processWithdrawal(data: { withdrawalId: string; action: string; adminId: string; reason?: string }) {
    try {
      const request = await this.withdrawalModel.findById(data.withdrawalId).lean();
      if (!request) return { success: false, error: 'Talep bulunamadı.' };
      if (request.status !== 'PENDING') return { success: false, error: 'Talep zaten işlenmiş.' };

      const session = await this.connection.startSession();
      try {
        await session.withTransaction(async () => {
          if (data.action === 'approve') {
            await this.withdrawalModel.updateOne(
              { _id: data.withdrawalId },
              { $set: { status: 'APPROVED', processedAt: new Date(), processedBy: data.adminId } },
              { session },
            );
            await this.walletModel.updateOne(
              { userId: request.userId },
              { $inc: { balanceTL: d128(new Decimal(request.amount.toString()).negated().toFixed(2)) } },
              { session },
            );
            await this.accountModel.updateOne(
              { userId: request.userId, type: 'MAIN' },
              { $inc: { balance: d128(new Decimal(request.amount.toString()).negated().toFixed(2)), blockedBalance: d128(new Decimal(request.amount.toString()).negated().toFixed(2)) } },
              { session },
            );
            await this.txModel.updateMany(
              { referenceId: data.withdrawalId, referenceType: 'WITHDRAWAL_REQUEST' },
              { $set: { status: 'COMPLETED' } },
              { session },
            );
          } else {
            await this.withdrawalModel.updateOne(
              { _id: data.withdrawalId },
              { $set: { status: 'REJECTED', processedAt: new Date(), processedBy: data.adminId, rejectionReason: data.reason || '' } },
              { session },
            );
            await this.accountModel.updateOne(
              { userId: request.userId, type: 'MAIN' },
              { $inc: { availableBalance: d128(new Decimal(request.amount.toString()).toFixed(2)), blockedBalance: d128(new Decimal(request.amount.toString()).negated().toFixed(2)) } },
              { session },
            );
            await this.txModel.updateMany(
              { referenceId: data.withdrawalId, referenceType: 'WITHDRAWAL_REQUEST' },
              { $set: { status: 'FAILED' } },
              { session },
            );
          }
        });
      } finally {
        await session.endSession();
      }

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'CreateGiftCard')
  async createGiftCard(data: { code?: string; amount: string; expiresAt?: string; customerId?: string; note?: string }) {
    try {
      let code = data.code?.trim() || '';
      if (!code) {
        const suffix = Math.random().toString(36).substring(2, 10).toUpperCase();
        code = `BZX-${suffix.substring(0, 4)}-${suffix.substring(4, 8)}`;
      }
      const amount = new Decimal(data.amount || '0');
      if (amount.isNegative()) throw new Error('Tutar negatif olamaz.');

      const newId = new Types.ObjectId().toString();
      await this.giftCardModel.create([{
        _id: newId, id: newId, code,
        initialValue: d128(amount.toFixed(2)), currentValue: d128(amount.toFixed(2)),
        expiresAt:   (data.expiresAt?.trim()) ? new Date(data.expiresAt) : undefined,
        customerId:  data.customerId?.trim() || undefined,
        note:        data.note || '',
        status:      'Active',
      }]);
      return { success: true, giftCardId: newId };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'ListGiftCards')
  async listGiftCards(data: { customerId?: string; page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: { customerId?: string } = {};
    if (data.customerId) where.customerId = data.customerId;

    const [items, total] = await Promise.all([
      this.giftCardModel.find(where).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.giftCardModel.countDocuments(where),
    ]);

    return {
      items: items.map(item => ({
        id: item._id ?? item.id, code: item.code,
        initialValue: item.initialValue.toString(), currentValue: item.currentValue.toString(),
        status: item.status, expiresAt: item.expiresAt ? item.expiresAt.toISOString() : '',
        customerId: item.customerId || '', note: item.note || '', createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }

  @GrpcMethod('FinancialService', 'GetGiftCard')
  async getGiftCard(data: { id: string }) {
    if (!data.id) throw new Error('Hediye kartı ID gereklidir.');
    const giftCard = await this.giftCardModel.findById(data.id).lean();
    if (!giftCard) throw new Error('Hediye kartı bulunamadı.');
    return {
      id: giftCard._id ?? giftCard.id, code: giftCard.code,
      initialValue: giftCard.initialValue.toString(), currentValue: giftCard.currentValue.toString(),
      status: giftCard.status, expiresAt: giftCard.expiresAt ? giftCard.expiresAt.toISOString() : '',
      customerId: giftCard.customerId || '', note: giftCard.note || '', createdAt: giftCard.createdAt.toISOString(),
    };
  }

  @GrpcMethod('FinancialService', 'TransferBetweenAccounts')
  async transferBetweenAccounts(data: { userId: string; fromAccountType: string; toAccountType: string; amount: string; note?: string }) {
    try {
      const amount = new Decimal(data.amount);
      if (!amount.isPositive()) throw new Error('Transfer tutarı sıfırdan büyük olmalıdır.');

      const session = await this.connection.startSession();
      let transactionId: string;
      try {
        await session.withTransaction(async () => {
          const fromAccount = await this.accountModel
            .findOne({ userId: data.userId, type: data.fromAccountType })
            .session(session)
            .lean();
          if (!fromAccount) throw new Error(`${data.fromAccountType} hesabı bulunamadı.`);
          if (new Decimal(fromAccount.availableBalance.toString()).lt(amount)) throw new Error('Yetersiz bakiye.');

          let toAccount = await this.accountModel
            .findOne({ userId: data.userId, type: data.toAccountType })
            .session(session)
            .lean();

          if (!toAccount) {
            const newId = new Types.ObjectId().toString();
            await this.accountModel.create(
              [{ _id: newId, id: newId, userId: data.userId, type: data.toAccountType, currency: 'TRY', status: 'ACTIVE', ownerType: 'CUSTOMER', balance: d128(0), availableBalance: d128(0), blockedBalance: d128(0), creditLimit: d128(0), isDirty: true }],
              { session },
            );
            toAccount = await this.accountModel.findOne({ userId: data.userId, type: data.toAccountType }).session(session).lean();
          }

          const amt = d128(amount.toFixed(2));
          await Promise.all([
            this.accountModel.updateOne({ _id: fromAccount._id ?? fromAccount.id }, { $inc: { balance: d128(-amount.toNumber()), availableBalance: d128(-amount.toNumber()) } }, { session }),
            this.accountModel.updateOne({ _id: toAccount!._id ?? toAccount!.id }, { $inc: { balance: amt, availableBalance: amt } }, { session }),
          ]);

          const referenceId = `trf-${Date.now()}`;
          const [, txTo] = await Promise.all([
            this.txModel.create([{ _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), accountId: fromAccount._id ?? fromAccount.id, amount: amt, type: 'TRANSFER', direction: 'DEBIT', status: 'COMPLETED', description: data.note || `${data.toAccountType} hesabına transfer`, referenceId, referenceType: 'INTERNAL_TRANSFER' }], { session }),
            this.txModel.create([{ _id: new Types.ObjectId().toString(), id: new Types.ObjectId().toString(), accountId: toAccount!._id ?? toAccount!.id, amount: amt, type: 'TRANSFER', direction: 'CREDIT', status: 'COMPLETED', description: data.note || `${data.fromAccountType} hesabından transfer`, referenceId, referenceType: 'INTERNAL_TRANSFER' }], { session }),
          ]);
          transactionId = txTo[0].id;
        });
      } finally {
        await session.endSession();
      }

      return { success: true, transactionId: transactionId! };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }
}
