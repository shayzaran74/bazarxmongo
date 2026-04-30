import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { VendorTier } from '@prisma/client';
import { GetMyEcosystemQuery } from './get-my-ecosystem.query';

@QueryHandler(GetMyEcosystemQuery)
export class GetMyEcosystemHandler
  implements IQueryHandler<GetMyEcosystemQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyEcosystemQuery) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: query.userId },
      include: {
        brandEcosystem: {
          include: { members: true }
        },
        memberOfEcosystem: {
          include: {
            owner: { include: { profile: true } }
          }
        }
      }
    });

    if (!vendor) return null;

    return {
      isOwner: !!vendor.brandEcosystem,
      ecosystem: vendor.brandEcosystem || vendor.memberOfEcosystem,
      isApexPlus: vendor.tier === VendorTier.APEX
    };
  }
}
