// apps/backend/src/modules/barter/application/queries/get-my-barter-offers.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyBarterOffersQuery } from './get-my-barter-offers.query';
import { PrismaService } from '@barterborsa/shared-persistence';
import { BadRequestException } from '@nestjs/common';

@QueryHandler(GetMyBarterOffersQuery)
export class GetMyBarterOffersHandler implements IQueryHandler<GetMyBarterOffersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyBarterOffersQuery) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: query.userId },
      include: { company: { select: { id: true } } },
    });

    if (!vendor || !vendor.company) {
      throw new BadRequestException('Satıcı hesabı veya şirket kaydı bulunamadı');
    }

    const offers = await this.prisma.tradeOffer.findMany({
      where: {
        OR: [
          { fromCompanyId: vendor.company.id },
          { toCompanyId: vendor.company.id },
        ],
        status: { in: ['PENDING', 'COUNTER_OFFERED', 'ACCEPTED'] },
      },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany:   { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return offers;
  }
}
