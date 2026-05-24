// apps/backend/src/modules/loyalty/domain/entities/missions-milestones.entities.ts

import { Entity, AggregateRoot } from '@barterborsa/shared-core';
import { MissionStatus } from '../enums/loyalty.enums';
import { MissionProgress } from '../value-objects/loyalty.vos';

export interface MissionProps {
  key: string;
  title: string;
  description?: string;
  xpReward: number;
  rewardType?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export class Mission extends AggregateRoot<MissionProps> {
  private constructor(props: MissionProps, id?: string) { super(props, id); }
  public static create(props: MissionProps, id?: string): Mission {
    return new Mission(props, id);
  }
}

export interface UserMissionProps {
  userId: string;
  missionId: string;
  status: MissionStatus;
  progress: MissionProgress;
  completedAt?: Date;
  claimedAt?: Date;
}

export class UserMission extends AggregateRoot<UserMissionProps> {
  private constructor(props: UserMissionProps, id?: string) { super(props, id); }
  public static start(userId: string, missionId: string, target: number): UserMission {
    const result = MissionProgress.create(0, target);
    if (!result.success) throw new Error('MissionProgress oluşturulamadı');
    const progress = result.data;
    return new UserMission({
      userId,
      missionId,
      status: MissionStatus.IN_PROGRESS,
      progress
    });
  }

  public updateProgress(current: number): void {
    const result = MissionProgress.create(current, this.props.progress.target);
    if (!result.success) throw new Error('MissionProgress güncellenemedi');
    const newProgress = result.data;
    this.props.progress = newProgress;
    if (this.isComplete() && this.props.status === MissionStatus.IN_PROGRESS) {
      this.complete();
    }
  }

  public isComplete(): boolean {
    return this.props.progress.current >= this.props.progress.target;
  }

  public complete(): void {
    this.props.status = MissionStatus.COMPLETED;
    this.props.completedAt = new Date();
  }

  public claimReward(): void {
    if (this.props.status !== MissionStatus.COMPLETED) throw new Error('Mission not completed');
    this.props.status = MissionStatus.CLAIMED;
    this.props.claimedAt = new Date();
  }
}

export interface MilestoneTrackerProps {
  userId: string;
  weeklyOrderCount: number;
  weeklyPeriodStart?: Date;
  weeklyBonusGiven: boolean;
  monthlySpendTotal: number;
  monthlyPeriodStart?: Date;
  monthlyBonusGiven: boolean;
}

export class MilestoneTracker extends AggregateRoot<MilestoneTrackerProps> {
  private constructor(props: MilestoneTrackerProps, id?: string) { super(props, id); }
  public static create(userId: string): MilestoneTracker {
    return new MilestoneTracker({
      userId,
      weeklyOrderCount: 0,
      weeklyBonusGiven: false,
      monthlySpendTotal: 0,
      monthlyBonusGiven: false,
      weeklyPeriodStart: new Date(),
      monthlyPeriodStart: new Date()
    });
  }

  public incrementWeeklyOrder(): void {
    this.props.weeklyOrderCount++;
  }

  public addMonthlySpend(amount: number): void {
    this.props.monthlySpendTotal += amount;
  }

  public resetWeekly(): void {
    this.props.weeklyOrderCount = 0;
    this.props.weeklyBonusGiven = false;
    this.props.weeklyPeriodStart = new Date();
  }

  public resetMonthly(): void {
    this.props.monthlySpendTotal = 0;
    this.props.monthlyBonusGiven = false;
    this.props.monthlyPeriodStart = new Date();
  }
}
