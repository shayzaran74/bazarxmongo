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

    // Kullanıcının tüm hesaplarını bul
    const userAccounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true, type: true }
    });
    const accountIds = userAccounts.map(a => a.id);

    let items: any[] = [];
    let total = 0;

    if (accountId && accountId !== '') {
      // Belirli bir hesabın hareketleri
      [items, total] = await Promise.all([
        this.prisma.accountTransaction.findMany({
          where: { accountId },
          include: { account: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.accountTransaction.count({ where: { accountId } })
      ]);
    } else {
      // Tüm hesapların hareketleri (AccountTransaction tablosu)
      if (accountIds.length === 0) {
        return { items: [], total: 0, page, limit };
      }
      [items, total] = await Promise.all([
        this.prisma.accountTransaction.findMany({
          where: { accountId: { in: accountIds } },
          include: { account: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.accountTransaction.count({
          where: { accountId: { in: accountIds } }
        })
      ]);
    }

    return {
      items: items.map((item: any) => {
        const account = item.account || userAccounts.find(a => a.id === item.accountId);
        const isDebit = item.direction === 'DEBIT';

        return {
          id: item.id,
          type: item.type || (isDebit ? 'WITHDRAWAL' : 'DEPOSIT'),
          amount: item.amount?.toString() || '0',
          status: item.status || 'COMPLETED',
          direction: item.direction || (isDebit ? 'DEBIT' : 'CREDIT'),
          description: item.description || '',
          referenceId: item.referenceId || '',
          referenceType: item.referenceType || item.refType || '',
          accountType: account?.type || 'MAIN',
          account: account ? { id: account.id, type: account.type } : null,
          createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
        };
      }),
      total,
      page,
      limit
    };
  }
}
