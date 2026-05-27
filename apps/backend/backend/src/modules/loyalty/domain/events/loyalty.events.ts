// apps/backend/src/modules/loyalty/domain/events/loyalty.events.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class XpEarnedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly currentXp: number,
    public readonly sourceType: string
  ) { super(userId); }
  get eventName(): string { return 'loyalty.xp_earned'; }
}

export class XpSpentEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly currentXp: number
  ) { super(userId); }
  get eventName(): string { return 'loyalty.xp_spent'; }
}

export class LevelUpEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly oldLevel: number,
    public readonly newLevel: number
  ) { super(userId); }
  get eventName(): string { return 'loyalty.level_up'; }
}

export class TierChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly fromTier: string,
    public readonly toTier: string
  ) { super(userId); }
  get eventName(): string { return 'loyalty.tier_changed'; }
}

export class MissionCompletedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly missionId: string,
    public readonly xpReward: number
  ) { super(userId); }
  get eventName(): string { return 'loyalty.mission_completed'; }
}

export class MilestoneAchievedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly type: 'WEEKLY' | 'MONTHLY',
    public readonly reward: number
  ) { super(userId); }
  get eventName(): string { return 'loyalty.milestone_achieved'; }
}

export class XpBatchExpiredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly batchId: string
  ) { super(userId); }
  get eventName(): string { return 'loyalty.xp_batch_expired'; }
}
