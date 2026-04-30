import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetAllPlansQuery } from './get-all-plans.query';

@QueryHandler(GetAllPlansQuery)
export class GetAllPlansHandler implements IQueryHandler<GetAllPlansQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const plans = await this.prisma.membershipPlan.findMany({
      where:   { isActive: true },
      orderBy: { monthlyFee: 'asc' },
    });

    return plans.map((p) => ({
      id:         p.id,
      tier:       p.tier,
      monthlyFee: Number(p.monthlyFee),
      annualFee:  p.annualFee ? Number(p.annualFee) : null,
      menuCredit: Number(p.menuCredit),
      breakeven:  Number(p.breakeven),
      benefits:   p.benefits,
    }));
  }
}
