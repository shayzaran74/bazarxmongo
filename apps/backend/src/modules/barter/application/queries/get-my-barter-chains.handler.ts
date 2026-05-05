// apps/backend/src/modules/barter/application/queries/get-my-barter-chains.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyBarterChainsQuery } from './get-my-barter-chains.query';
import { PrismaService } from '@barterborsa/shared-persistence';
import { BadRequestException } from '@nestjs/common';

@QueryHandler(GetMyBarterChainsQuery)
export class GetMyBarterChainsHandler implements IQueryHandler<GetMyBarterChainsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyBarterChainsQuery) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: query.userId },
      include: { company: { select: { id: true } } },
    });

    if (!vendor || !vendor.company) {
      throw new BadRequestException('Satıcı hesabı veya şirket kaydı bulunamadı');
    }

    const sessions = await this.prisma.swapSession.findMany({
      where: {
        OR: [
          { initiatorId: vendor.company.id },
          { receiverId: vendor.company.id },
        ],
      },
      include: {
        tradeOffer: {
          include: {
            fromCompany: { select: { id: true, name: true } },
            toCompany:   { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }
}
