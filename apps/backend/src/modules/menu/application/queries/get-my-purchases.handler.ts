// apps/backend/src/modules/menu/application/queries/get-my-purchases.handler.ts
// BazarX Go: Aktif QR'lar — MenuPurchase artık Listing FK'sı ile çalışır

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
      where.status      = { in: ['ACTIVE', 'PARTIALLY_REDEEMED'] };
      where.qrExpiresAt = { gte: new Date() };
    }

    const purchases = await this.prisma.menuPurchase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            title:  true,
            vendor: {
              select: {
                id:      true,
                profile: { select: { storeName: true, city: true, district: true } },
              },
            },
          },
        },
      },
    });

    return purchases.map((p) => ({
      id:               p.id,
      status:           p.status,
      menuTitle:        p.listing.title,
      restaurant: {
        id:       p.listing.vendor.id,
        name:     p.listing.vendor.profile?.storeName ?? '',
        city:     p.listing.vendor.profile?.city ?? null,
        district: p.listing.vendor.profile?.district ?? null,
      },
      paidAmount:       Number(p.paidAmount),
      qrCode:           p.qrCode,
      qrExpiresAt:      p.qrExpiresAt,
      oneFreeQrCode:    p.oneFreeQrCode,
      oneFreeActivated: !!p.oneFreeActivatedAt,
      oneFreeUsed:      !!p.oneFreeUsedAt,
      xpEarned:         p.xpEarned,
      createdAt:        p.createdAt,
    }));
  }
}
