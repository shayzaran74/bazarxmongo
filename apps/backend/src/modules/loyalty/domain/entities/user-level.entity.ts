// apps/backend/src/modules/loyalty/domain/entities/user-level.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface UserLevelProps {
  userId: string;
  currentXp: number;
  lifetimeXp: number;
  level: number;
  tierId?: string;
  lastLoginBonusAt?: Date;
  isFirstOrder: Boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserLevel extends AggregateRoot<UserLevelProps> {
  private constructor(props: UserLevelProps, id?: string) { super(props, id); }

  public static create(userId: string): UserLevel {
    const now = new Date();
    return new UserLevel({
      userId,
      currentXp: 0,
      lifetimeXp: 0,
      level: 1,
      isFirstOrder: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromPersistence(props: UserLevelProps, id: string): UserLevel {
    return new UserLevel(props, id);
  }

  public addXp(amount: number): void {
    this.props.currentXp += amount;
    this.props.lifetimeXp += amount;
    this.props.updatedAt = new Date();
  }

  public spendXp(amount: number): void {
    if (this.props.currentXp < amount) throw new Error('Insufficient XP');
    this.props.currentXp -= amount;
    this.props.updatedAt = new Date();
  }

  public setLevel(level: number): void {
    this.props.level = level;
    this.props.updatedAt = new Date();
  }

  public setTier(tierId: string): void {
    this.props.tierId = tierId;
    this.props.updatedAt = new Date();
  }

  public grantLoginBonus(): void {
    this.props.lastLoginBonusAt = new Date();
    this.props.updatedAt = new Date();
  }

  public markFirstOrderUsed(): void {
    this.props.isFirstOrder = false;
    this.props.updatedAt = new Date();
  }

  public canReceiveLoginBonus(): boolean {
    if (!this.props.lastLoginBonusAt) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.props.lastLoginBonusAt < today;
  }
}
