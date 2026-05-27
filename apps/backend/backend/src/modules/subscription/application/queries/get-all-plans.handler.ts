// apps/backend/src/modules/subscription/application/queries/get-all-plans.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMembershipPlan } from '@barterborsa/shared-persistence';
import { GetAllPlansQuery } from './get-all-plans.query';

interface PlanDto {
  id: string;
  tier: string;
  monthlyFee: number;
  annualFee: number | null;
  menuCredit: number;
  breakeven: number;
  benefits: string[];
}

@QueryHandler(GetAllPlansQuery)
export class GetAllPlansHandler implements IQueryHandler<GetAllPlansQuery> {
  constructor(
    @InjectModel('MembershipPlan') private readonly planModel: Model<IMembershipPlan>,
  ) {}

  async execute(): Promise<PlanDto[]> {
    const plans = await this.planModel
      .find({ isActive: true })
      .sort({ monthlyFee: 1 })
      .lean();

    return plans.map(p => ({
      id:         p.id,
      tier:       p.tier,
      monthlyFee: parseFloat(p.monthlyFee.toString()),
      annualFee:  p.annualFee ? parseFloat(p.annualFee.toString()) : null,
      menuCredit: parseFloat(p.menuCredit.toString()),
      breakeven:  parseFloat(p.breakeven.toString()),
      benefits:   (p.benefits ?? []) as string[],
    }));
  }
}
