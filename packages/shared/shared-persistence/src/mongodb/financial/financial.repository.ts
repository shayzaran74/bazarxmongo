// packages/shared/shared-persistence/src/mongodb/financial/financial.repository.ts
// Financial repository — MongoDB transaction ile para hareketleri
// ADR-005 §0.5: Decimal128 + Money API zorunlu, transaction ile birlikte

import { Injectable, ConflictException } from '@nestjs/common';
import { Model, Connection, Types } from 'mongoose';
import { Decimal } from 'decimal.js';
import { Wallet, IWallet } from '../../schemas/financial/wallet.schema';
import { Account, IAccount } from '../../schemas/financial/account.schema';
import { AccountTransaction, IAccountTransaction, TransactionType, TransactionTypeType } from '../../schemas/financial/accountTransaction.schema';
import { AccountHold, IAccountHold, HoldStatus, HoldStatusType, HoldReason, HoldReasonType } from '../../schemas/financial/accountHold.schema';
import { Escrow, IEscrow, EscrowStatus } from '../../schemas/financial/escrow.schema';
import { GeneralLedger, IGeneralLedger } from '../../schemas/financial/generalLedger.schema';
import { CommissionRecord, ICommissionRecord, CommissionStatus, CommissionType, CommissionTypeType } from '../../schemas/financial/commissionRecord.schema';
import { UserLedgerEntry, IUserLedgerEntry } from '../../schemas/financial/userLedgerEntry.schema';
import { Payment, IPayment, PaymentStatus } from '../../schemas/financial/payment.schema';

// Money API kullanımı için Decimal128 wrapper
// NOT: Money sınıfı shared-core/math/decimal.ts'te tanımlı
// Bu repository'de doğrudan Decimal128 + atomic operator kullanılıyor
// Transaction içinde tüm para operasyonları yürütülür

@Injectable()
export class WalletRepository {
  constructor(private readonly connection: Connection) {}

  async findByUser(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId }).lean();
  }

  async createWallet(userId: string): Promise<IWallet> {
    const doc = new Wallet({
      id: new Types.ObjectId().toString(),
      userId,
      balanceTL: Types.Decimal128.fromString('0'),
      barterBalance: Types.Decimal128.fromString('0'),
      xpAdsBalance: Types.Decimal128.fromString('0'),
      xpCommissionBalance: Types.Decimal128.fromString('0'),
      xpTradeBalance: Types.Decimal128.fromString('0'),
      xpPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async updateBalance(
    userId: string,
    field: 'balanceTL' | 'barterBalance' | 'xpAdsBalance' | 'xpCommissionBalance' | 'xpTradeBalance',
    amount: Types.Decimal128,
    session?: any
  ): Promise<boolean> {
    const res = await Wallet.updateOne(
      { userId },
      {
        $inc: { [field]: amount },
        $set: { updatedAt: new Date() },
      },
      { session }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class AccountRepository {
  constructor(private readonly connection: Connection) {}

  async findByUser(userId: string, type: string): Promise<IAccount | null> {
    return Account.findOne({ userId, type }).lean();
  }

  async createAccount(userId: string, type: string, ownerType: string): Promise<IAccount> {
    const doc = new Account({
      id: new Types.ObjectId().toString(),
      userId,
      type,
      ownerType,
      balance: Types.Decimal128.fromString('0'),
      availableBalance: Types.Decimal128.fromString('0'),
      blockedBalance: Types.Decimal128.fromString('0'),
      creditLimit: Types.Decimal128.fromString('0'),
      isDirty: true,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async holdFunds(
    accountId: string,
    amount: Types.Decimal128,
    reason: HoldReasonType,
    referenceId: string,
    referenceType: string,
    idempotencyKey?: string,
    expiresAt?: Date
  ): Promise<IAccountHold | null> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        // Check available balance
        const account = await Account.findOne({ _id: accountId }).session(session).lean();
        if (!account) return null;

        // Atomic hold: decrease available, increase blocked
        const balanceNum = new Decimal(account.availableBalance.toString());
        const amountNum = new Decimal(amount.toString());
        if (balanceNum.lt(amountNum)) return null;

        await Account.updateOne(
          { _id: accountId },
          {
            $inc: {
              availableBalance: Types.Decimal128.fromString(amountNum.negated().toFixed(2)),
              blockedBalance: amount,
            },
            $set: { isDirty: true, updatedAt: new Date() },
          },
          { session }
        );

        const hold = new AccountHold({
          id: new Types.ObjectId().toString(),
          accountId,
          amount,
          reason,
          status: 'ACTIVE',
          referenceId,
          referenceType,
          idempotencyKey,
          expiresAt: expiresAt ?? new Date(Date.now() + 15 * 60 * 1000), // 15 min default
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await hold.save({ session });
        return hold;
      });
    } finally {
      await session.endSession();
    }
  }

  async releaseHold(holdId: string, releasedBy?: string): Promise<boolean> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const hold = await AccountHold.findOne({ _id: holdId, status: 'ACTIVE' }).session(session).lean();
        if (!hold) return false;

        await Account.updateOne(
          { _id: hold.accountId },
          {
            $inc: {
              availableBalance: hold.amount,
              blockedBalance: Types.Decimal128.fromString(new Decimal(hold.amount.toString()).negated().toFixed(2)),
            },
            $set: { isDirty: true, updatedAt: new Date() },
          },
          { session }
        );

        await AccountHold.updateOne(
          { _id: holdId },
          {
            $set: {
              status: 'RELEASED',
              releasedAt: new Date(),
              releasedBy,
              updatedAt: new Date(),
            },
          },
          { session }
        );

        return true;
      });
    } finally {
      await session.endSession();
    }
  }

  async createTransaction(input: {
    accountId: string;
    amount: Types.Decimal128;
    type: TransactionTypeType;
    description?: string;
    referenceId?: string;
    referenceType?: string;
    idempotencyKey?: string;
  }): Promise<IAccountTransaction> {
    const doc = new AccountTransaction({
      id: new Types.ObjectId().toString(),
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }
}

@Injectable()
export class EscrowRepository {
  constructor(private readonly connection: Connection) {}

  async findByOrder(orderId: string): Promise<IEscrow | null> {
    return Escrow.findOne({ orderId }).lean();
  }

  async createEscrow(orderId: string, buyerId: string, sellerId: string, amount: Types.Decimal128): Promise<IEscrow> {
    const doc = new Escrow({
      id: new Types.ObjectId().toString(),
      orderId,
      buyerId,
      sellerId,
      amount,
      status: 'PENDING',
      releasedAmount: Types.Decimal128.fromString('0'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async holdEscrow(escrowId: string): Promise<boolean> {
    const res = await Escrow.updateOne(
      { _id: escrowId, status: 'PENDING' },
      { $set: { status: 'HELD', updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async releaseEscrow(escrowId: string, releasedAmount: Types.Decimal128): Promise<boolean> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const escrow = await Escrow.findOne({ _id: escrowId, status: 'HELD' }).session(session).lean();
        if (!escrow) return false;

        await Escrow.updateOne(
          { _id: escrowId },
          {
            $set: {
              status: 'RELEASED',
              releasedAmount,
              releasedAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { session }
        );

        // Create ledger entries
        const ledgerDebit = new GeneralLedger({
          id: new Types.ObjectId().toString(),
          debitAccountId: escrow.buyerId,
          creditAccountId: escrow.sellerId,
          amount: releasedAmount,
          type: 'DEBIT',
          refType: 'ESCROW',
          referenceId: escrowId,
          createdAt: new Date(),
        });
        await ledgerDebit.save({ session });

        return true;
      });
    } finally {
      await session.endSession();
    }
  }

  async refundEscrow(escrowId: string): Promise<boolean> {
    const res = await Escrow.updateOne(
      { _id: escrowId, status: 'HELD' },
      { $set: { status: 'REFUNDED', updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class CommissionRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    vendorId: string;
    vendorTier: string;
    baseAmount: Types.Decimal128;
    commissionRate: Types.Decimal128;
    commissionAmount: Types.Decimal128;
    commissionType: CommissionTypeType;
    orderId?: string;
    tradeOfferId?: string;
    idempotencyKey?: string;
  }): Promise<ICommissionRecord> {
    const doc = new CommissionRecord({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'CALCULATED',
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async markCollected(id: string): Promise<boolean> {
    const res = await CommissionRecord.updateOne(
      { _id: id, status: 'CALCULATED' },
      {
        $set: {
          status: 'COLLECTED',
          collectedAt: new Date(),
        },
      }
    );
    return res.modifiedCount > 0;
  }

  async findByVendor(vendorId: string, limit = 100): Promise<ICommissionRecord[]> {
    return CommissionRecord.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async findPendingCollection(limit = 100): Promise<ICommissionRecord[]> {
    return CommissionRecord.find({ status: 'CALCULATED' })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
  }
}

@Injectable()
export class LedgerRepository {
  constructor(private readonly connection: Connection) {}

  async createEntry(input: {
    debitAccountId?: string;
    creditAccountId?: string;
    amount?: Types.Decimal128;
    type: 'DEBIT' | 'CREDIT';
    refType?: string;
    referenceId?: string;
    note?: string;
    payload?: Record<string, unknown>;
    actorId?: string;
  }): Promise<IGeneralLedger> {
    const doc = new GeneralLedger({
      id: new Types.ObjectId().toString(),
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByReference(refType: string, referenceId: string): Promise<IGeneralLedger[]> {
    return GeneralLedger.find({ refType, referenceId }).sort({ createdAt: -1 }).lean();
  }

  async findByAccount(accountId: string, limit = 100): Promise<IGeneralLedger[]> {
    return GeneralLedger.find({
      $or: [{ debitAccountId: accountId }, { creditAccountId: accountId }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

@Injectable()
export class PaymentRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    userId: string;
    orderId?: string;
    amount: Types.Decimal128;
    paymentType: string;
    metadata?: Record<string, unknown>;
    accountTransactionId?: string;
  }): Promise<IPayment> {
    const doc = new Payment({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async markPaid(id: string): Promise<boolean> {
    const res = await Payment.updateOne(
      { _id: id, status: 'PENDING' },
      { $set: { status: 'COMPLETED', paidAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async markFailed(id: string, reason: string): Promise<boolean> {
    const res = await Payment.updateOne(
      { _id: id, status: 'PENDING' },
      { $set: { status: 'FAILED', failedAt: new Date(), failureReason: reason, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async findByOrder(orderId: string): Promise<IPayment[]> {
    return Payment.find({ orderId }).sort({ createdAt: -1 }).lean();
  }

  async findByUser(userId: string, limit = 50): Promise<IPayment[]> {
    return Payment.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }
}