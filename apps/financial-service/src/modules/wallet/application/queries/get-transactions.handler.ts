// apps/financial-service/src/modules/wallet/application/queries/get-transactions.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransactionsQuery } from './get-transactions.query';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@QueryHandler(GetTransactionsQuery)
export class GetTransactionsHandler implements IQueryHandler<GetTransactionsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTransactionsQuery) {
    const { userId, page, limit, accountId } = query;
    const skip = (page - 1) * limit;

    try {
      // 1. Get user accounts
      const userAccounts = await this.prisma.account.findMany({
        where: { userId },
        select: { id: true, type: true }
      });
      const accountIds = userAccounts.map(a => a.id);

      // 2. Fetch from both tables (AccountTransaction and GeneralLedger)
      const [accTx, genLedger] = await Promise.all([
        this.prisma.accountTransaction.findMany({
          where: accountId ? { accountId } : { accountId: { in: accountIds } },
          include: { account: true },
          orderBy: { createdAt: 'desc' },
          take: limit * 2, // Take extra to merge
        }),
        this.prisma.generalLedger.findMany({
          where: {
            OR: [
              { debitAccountId: userId },
              { creditAccountId: userId },
              { debitAccountId: { in: accountIds } },
              { creditAccountId: { in: accountIds } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: limit * 2,
        })
      ]);

      // 3. Map and Merge
      const mappedAccTx = accTx.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount.toString(),
        direction: tx.direction,
        description: tx.description || '',
        referenceId: tx.referenceId || '',
        referenceType: tx.referenceType || '',
        accountType: tx.account?.type || 'MAIN',
        createdAt: tx.createdAt,
        source: 'account_tx'
      }));

      const mappedGenLedger = genLedger.map(gl => {
        const isDebit = gl.debitAccountId === userId || accountIds.includes(gl.debitAccountId || '');
        return {
          id: gl.id,
          type: gl.type,
          amount: gl.amount?.toString() || '0',
          direction: isDebit ? 'DEBIT' : 'CREDIT',
          description: gl.note || '',
          referenceId: gl.referenceId || '',
          referenceType: gl.refType || '',
          accountType: 'SYSTEM', // General Ledger entries are global
          createdAt: gl.createdAt,
          source: 'general_ledger'
        };
      });

      // Combine, Deduplicate by referenceId if needed, and Sort
      const combined = [...mappedAccTx, ...mappedGenLedger]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(skip, skip + limit);

      const total = accTx.length + genLedger.length; // Approximate for pagination

      return {
        items: combined.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          status: 'COMPLETED'
        })),
        total,
        page,
        limit
      };
    } catch (error: any) {
      console.error('[GetTransactionsHandler] Error:', error);
      throw error;
    }
  }
}
