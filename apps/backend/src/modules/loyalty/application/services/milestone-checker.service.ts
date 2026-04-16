// apps/backend/src/modules/loyalty/application/services/milestone-checker.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { IMilestoneTrackerRepository } from '../../domain/repositories/loyalty.repository.interfaces';
import { MilestoneTracker } from '../../domain/entities/missions-milestones.entities';

@Injectable()
export class MilestoneCheckerService {
  constructor(
    @Inject('IMilestoneTrackerRepository') private readonly repository: IMilestoneTrackerRepository
  ) {}

  async checkAndUpdateMilestones(userId: string, orderAmount?: number): Promise<void> {
    let tracker = await this.repository.findByUserId(userId);
    if (!tracker) {
      tracker = MilestoneTracker.create(userId);
    }

    // Periyot kontrolü ve reset (Basit versiyon)
    const now = new Date();
    // Reset weekly if more than 7 days
    const weeklyStart = tracker.getProps().weeklyPeriodStart;
    if (weeklyStart && (now.getTime() - weeklyStart.getTime()) > 7 * 24 * 3600 * 1000) {
      tracker.resetWeekly();
    }
    const monthlyStart = tracker.getProps().monthlyPeriodStart;
    if (monthlyStart && monthlyStart.getMonth() !== now.getMonth()) {
      tracker.resetMonthly();
    }

    if (orderAmount !== undefined) {
      tracker.incrementWeeklyOrder();
      tracker.addMonthlySpend(orderAmount);
    }

    // Milestone checks
    if (tracker.getProps().weeklyOrderCount >= 3 && !tracker.getProps().weeklyBonusGiven) {
      // Emit MilestoneAchieved event via aggregate root (actually handled in command/event publishers)
      (tracker.getProps() as any).weeklyBonusGiven = true;
    }

    if (tracker.getProps().monthlySpendTotal >= 1000 && !tracker.getProps().monthlyBonusGiven) {
      (tracker.getProps() as any).monthlyBonusGiven = true;
    }

    await this.repository.save(tracker);
  }
}
