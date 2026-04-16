// apps/backend/src/modules/loyalty/infrastructure/persistence/prisma-loyalty.repositories.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import * as repo from '../../domain/repositories/loyalty.repository.interfaces';
import { UserLevel } from '../../domain/entities/user-level.entity';
import { XpTransaction, XpBatch } from '../../domain/entities/loyalty-misc.entities';
import { Mission, UserMission, MilestoneTracker } from '../../domain/entities/missions-milestones.entities';
import { LoyaltyMappers } from './mappers/loyalty.mappers';

@Injectable()
export class PrismaUserLevelRepository implements repo.IUserLevelRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; }
  async findAll() { return []; }
  async delete(id: string) { return; }
  async findByUserId(userId: string) {
    const raw = await this.prisma.userLevel.findUnique({ where: { userId } });
    return raw ? LoyaltyMappers.userLevelToDomain(raw) : null;
  }
  async save(entity: UserLevel) {
    const data = LoyaltyMappers.userLevelToPersistence(entity);
    await this.prisma.userLevel.upsert({ where: { userId: entity.getProps().userId }, create: data, update: data });
  }
}

@Injectable()
export class PrismaXpTransactionRepository implements repo.IXpTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; } async findAll() { return []; } async delete(id: string) { return; }
  async save(entity: XpTransaction) {
    const data = { ...entity.getProps(), id: entity.id.toString() };
    await this.prisma.xpTransaction.create({ data });
  }
  async findByUserId(userId: string, skip: number, take: number) {
    const raws = await this.prisma.xpTransaction.findMany({ where: { userId }, skip, take, orderBy: { createdAt: 'desc' } });
    return raws.map(r => (XpTransaction as any).create(r, r.id));
  }
  async sumSpentInPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const agg = await this.prisma.xpTransaction.aggregate({
      where: { userId, createdAt: { gte: startDate, lte: endDate }, amount: { lt: 0 } },
      _sum: { amount: true }
    });
    return agg._sum.amount || 0;
  }
}

@Injectable()
export class PrismaXpBatchRepository implements repo.IXpBatchRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; } async findAll() { return []; } async delete(id: string) { return; }
  async save(entity: XpBatch) {
    const data = LoyaltyMappers.xpBatchToPersistence(entity);
    await this.prisma.xpBatch.upsert({ where: { id: entity.id.toString() }, create: data, update: data });
  }
  async findAvailableBatches(accountId: string) {
    const raws = await this.prisma.xpBatch.findMany({
      where: { accountId, currentBalance: { gt: 0 }, expiresAt: { gt: new Date() }, isBurned: false },
      orderBy: { createdAt: 'asc' } // FIFO
    });
    return raws.map(LoyaltyMappers.xpBatchToDomain);
  }
  async findExpiredBatches(now: Date) {
    const raws = await this.prisma.xpBatch.findMany({ where: { expiresAt: { lte: now }, isBurned: false } });
    return raws.map(LoyaltyMappers.xpBatchToDomain);
  }
}

@Injectable()
export class PrismaMissionRepository implements repo.IMissionRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; } async findAll() { return []; } async delete(id: string) { return; }
  async save(entity: Mission) {
    const d = { ...entity.getProps(), id: entity.id.toString() };
    await this.prisma.mission.upsert({ where: { id: d.id }, create: d, update: d });
  }
  async findActive() {
    const rs = await this.prisma.mission.findMany({ where: { isActive: true } });
    return rs.map(r => Mission.create(r as any, r.id));
  }
}

@Injectable()
export class PrismaUserMissionRepository implements repo.IUserMissionRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; } async findAll() { return []; } async delete(id: string) { return; }
  async save(entity: UserMission) {
    const props = entity.getProps();
    const data = { 
      userId: props.userId, missionId: props.missionId, status: props.status, 
      progress: props.progress as any, completedAt: props.completedAt, claimedAt: props.claimedAt 
    };
    await this.prisma.userMission.upsert({ 
      where: { userId_missionId: { userId: props.userId, missionId: props.missionId } }, 
      create: { ...data, id: entity.id.toString() }, 
      update: data 
    });
  }
  async findByUserId(userId: string) {
    const rs = await this.prisma.userMission.findMany({ where: { userId }, include: { mission: true } });
    return rs.map(r => (UserMission as any).create({ ...r }, r.id));
  }
  async findOne(userId: string, missionId: string) {
    const r = await this.prisma.userMission.findUnique({ where: { userId_missionId: { userId, missionId } } });
    return r ? (UserMission as any).create({ ...r }, r.id) : null;
  }
}

@Injectable()
export class PrismaMilestoneTrackerRepository implements repo.IMilestoneTrackerRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; } async findAll() { return []; } async delete(id: string) { return; }
  async findByUserId(userId: string) {
    const r = await this.prisma.milestoneTracker.findUnique({ where: { userId } });
    return r ? (MilestoneTracker as any).create({ ...r, monthlySpendTotal: Number(r.monthlySpendTotal) }, r.id) : null;
  }
  async save(entity: MilestoneTracker) {
    const props = entity.getProps();
    const data = { ...props, id: entity.id.toString() };
    await this.prisma.milestoneTracker.upsert({ where: { userId: props.userId }, create: data, update: data });
  }
}
