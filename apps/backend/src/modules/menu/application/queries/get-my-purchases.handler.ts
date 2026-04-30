import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetMyPurchasesQuery } from './get-my-purchases.query';
import { Prisma } from '@prisma/client';

@QueryHandler(GetMyPurchasesQuery)
export class GetMyPurchasesHandler implements IQueryHandler<GetMyPurchasesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyPurchasesQuery) {
    const { userId, activeOnly } = query;

    const where: Prisma.MenuPurchaseWhereInput = { userId };
    if (activeOnly) {
      where.status  = { in: ['ACTIVE', 'PARTIALLY_REDEEMED'] };
      where.qrExpiresAt = { gte: new Date() };
    }

    const purchases = await this.prisma.menuPurchase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        menu: {
          include: { restaurant: { select: { name: true, city: true, address: true } } },
        },
      },
    });

    return purchases.map((p) => ({
      id:                  p.id,
      status:              p.status,
      menuTitle:           p.menu.title,
      restaurant:          p.menu.restaurant,
      paidAmount:          Number(p.paidAmount),
      qrCode:              p.qrCode,
      qrExpiresAt:         p.qrExpiresAt,
      oneFreeQrCode:       p.oneFreeQrCode,
      oneFreeActivated:    !!p.oneFreeActivatedAt,
      oneFreeUsed:         !!p.oneFreeUsedAt,
      xpEarned:            p.xpEarned,
      createdAt:           p.createdAt,
    }));
  }
}
