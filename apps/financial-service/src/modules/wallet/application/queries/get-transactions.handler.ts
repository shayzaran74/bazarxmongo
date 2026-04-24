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

    let items: any[] = [];
    let total = 0;

    // Get all account IDs for the user to query GeneralLedger correctly
    const userAccounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true, type: true }
    });
    const accountIds = userAccounts.map(a => a.id);

    if (accountId && accountId !== '') {
      [items, total] = await Promise.all([
        this.prisma.accountTransaction.findMany({
          where: { accountId },
          include: { account: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.accountTransaction.count({
          where: { accountId },
        })
      ]);
    } else {
      [items, total] = await Promise.all([
        this.prisma.generalLedger.findMany({
          where: {
            OR: [
              { debitAccountId: { in: [...accountIds, userId] } },
              { creditAccountId: { in: [...accountIds, userId] } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.generalLedger.count({
          where: {
            OR: [
              { debitAccountId: { in: [...accountIds, userId] } },
              { creditAccountId: { in: [...accountIds, userId] } }
            ]
          }
        })
      ]);
    }

    return {
      items: items.map((item: any) => {
        const myIds = [...accountIds, userId];
        const isDebit = myIds.includes(item.debitAccountId) || item.direction === 'DEBIT' || item.type === 'WITHDRAW';
        const targetAccountId = myIds.includes(item.debitAccountId) ? item.debitAccountId : item.creditAccountId;
        const account = item.account || userAccounts.find(a => a.id === targetAccountId);

        return {
          id: item.id,
          type: item.type || (isDebit ? 'WITHDRAW' : 'DEPOSIT'),
          amount: item.amount?.toString() || '0',
          status: 'COMPLETED',
          direction: isDebit ? 'DEBIT' : 'CREDIT',
          description: item.note || item.description || '',
          referenceId: item.referenceId || '',
          referenceType: item.refType || '',
          accountType: account?.type || 'MAIN',
          account: account ? { id: account.id, type: account.type } : null,
          createdAt: item.createdAt.toISOString()
        };
      }),
      total,
      page,
      limit
    };
  }
}
