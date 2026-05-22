// apps/financial-service/src/modules/wallet/application/queries/get-transactions.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetTransactionsQuery } from './get-transactions.query';
import {
  IFinancialAccount,
  IFinancialAccountTransaction,
  IFinancialGeneralLedger,
} from '@barterborsa/shared-persistence';

interface TransactionItem {
  id:            string;
  type:          string;
  amount:        string;
  direction:     string;
  description:   string;
  referenceId:   string;
  referenceType: string;
  accountType:   string;
  createdAt:     string;
  source:        string;
  status:        string;
}

interface TransactionResult {
  items: TransactionItem[];
  total: number;
  page:  number;
  limit: number;
}

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(
    @InjectModel('Account') private readonly accountModel: Model<IFinancialAccount>,
    @InjectModel('AccountTransaction') private readonly txModel: Model<IFinancialAccountTransaction>,
    @InjectModel('GeneralLedger') private readonly ledgerModel: Model<IFinancialGeneralLedger>,
  ) {}

  private parseDate(dateVal: unknown, idVal?: string): Date {
    if (dateVal instanceof Date) return dateVal;
    if (dateVal) {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) return d;
    }
    if (idVal && idVal.length === 24) {
      try {
        const timestamp = parseInt(idVal.substring(0, 8), 16) * 1000;
        if (!isNaN(timestamp)) return new Date(timestamp);
      } catch (_) {}
    }
    return new Date(0);
  }

  async execute(query: GetTransactionsQuery): Promise<TransactionResult> {
    const { userId, page, limit, accountId } = query;
    const skip    = (page - 1) * limit;
    const isGlobal = !userId;

    let accountIds: string[] = [];
    if (!isGlobal) {
      const userAccounts = await this.accountModel.find({ userId }, { _id: 1, type: 1 }).lean();
      accountIds = userAccounts.map(a => (a._id ?? a.id) as string);
    }

    const txFilter = isGlobal
      ? (accountId ? { accountId } : {})
      : (accountId ? { accountId } : { accountId: { $in: accountIds } });

    const ledgerFilter = isGlobal
      ? {}
      : { $or: [{ debitAccountId: userId }, { creditAccountId: userId }, { debitAccountId: { $in: accountIds } }, { creditAccountId: { $in: accountIds } }] };

    const [accTx, genLedger] = await Promise.all([
      this.txModel.find(txFilter).sort({ createdAt: -1 }).limit(limit * 2).lean(),
      this.ledgerModel.find(ledgerFilter).sort({ createdAt: -1 }).limit(limit * 2).lean(),
    ]);

    const accountTypeMap = new Map<string, string>();
    if (!isGlobal) {
      const accounts = await this.accountModel.find({ userId }, { _id: 1, type: 1 }).lean();
      accounts.forEach(a => accountTypeMap.set((a._id ?? a.id) as string, a.type));
    }

    const mappedAccTx = accTx.map(tx => {
      const txId = (tx._id ?? tx.id) as string;
      const type = accountTypeMap.get(tx.accountId) ?? 'MAIN';
      return {
        id:            txId,
        type:          tx.type,
        amount:        tx.amount.toString(),
        direction:     tx.direction ?? '',
        description:   tx.description || '',
        referenceId:   tx.referenceId || '',
        referenceType: tx.referenceType || '',
        accountType:   type,
        account:       { type },
        createdAt:     this.parseDate(tx.createdAt, txId),
        source:        'account_tx' as const,
        status:        tx.status ?? 'COMPLETED',
      };
    });

    const mappedGenLedger = genLedger.map(gl => {
      const glId = (gl._id ?? gl.id) as string;
      const isDebit = gl.debitAccountId === userId || accountIds.includes(gl.debitAccountId ?? '');
      return {
        id:            glId,
        type:          gl.type,
        amount:        gl.amount?.toString() || '0',
        direction:     isDebit ? 'DEBIT' : 'CREDIT',
        description:   gl.note || '',
        referenceId:   gl.referenceId || '',
        referenceType: gl.refType || '',
        accountType:   'SYSTEM',
        account:       { type: 'SYSTEM' },
        createdAt:     this.parseDate(gl.createdAt, glId),
        source:        'general_ledger' as const,
        status:        'COMPLETED',
      };
    });

    const combined = [...mappedAccTx, ...mappedGenLedger]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    return {
      items: combined.map(item => ({ ...item, createdAt: item.createdAt.toISOString() })),
      total: accTx.length + genLedger.length,
      page,
      limit,
    };
  }
}
