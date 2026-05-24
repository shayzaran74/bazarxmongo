// apps/backend/src/modules/loyalty/infrastructure/persistence/mongo-loyalty.repositories.ts
// ADR-005: Prisma→Mongoose geçiş — tüm repository'ler Mongoose Model kullanır

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as repo from '../../domain/repositories/loyalty.repository.interfaces';
import { UserLevel } from '../../domain/entities/user-level.entity';
import { XpTransaction, XpBatch } from '../../domain/entities/loyalty-misc.entities';
import { Mission, UserMission, MilestoneTracker } from '../../domain/entities/missions-milestones.entities';
import { LoyaltyMappers } from './mappers/loyalty.mappers';
import {
  IUserLevel, IXpTransaction, IXpBatch, IMission, IUserMission, IMilestoneTracker,
} from '@barterborsa/shared-persistence';

// Aliases removed

@Injectable()
export class MongoUserLevelRepository implements repo.IUserLevelRepository {
  private readonly logger = new Logger(MongoUserLevelRepository.name);
  constructor(
    @InjectModel('UserLevel') private readonly model: Model<IUserLevel>,
  ) { }
  async findById(_id: string) { return null; }
  async findAll() { return []; }
  async delete(_id: string) { return; }

  async findByUserId(userId: string) {
    try {
      const raw = await this.model.findOne({ userId } as Record<string, unknown>).lean();
      this.logger.debug(`findByUserId raw keys: ${raw ? Object.keys(raw).join(',') : 'null'}, userId typeof=${typeof raw?.userId}, userId value=${JSON.stringify(raw?.userId)}`);
      return raw ? LoyaltyMappers.userLevelToDomain(raw) : null;
    } catch (err: unknown) {
      this.logger.error(`findByUserId failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  async save(entity: UserLevel) {
    try {
      const props = entity.getProps();
      this.logger.debug(`save props keys: ${Object.keys(props).join(',')}, userId=${JSON.stringify(props.userId)}, typeof=${typeof props.userId}`);
      const userId = String(props.userId ?? '');
      const filter = { userId } as Record<string, unknown>;
      const updateData = {
        $set: {
          id: entity.id?.toString() ?? new Types.ObjectId().toString(),
          userId,
          currentXp: props.currentXp,
          lifetimeXp: props.lifetimeXp,
          level: props.level,
          tierId: props.tierId ?? undefined,
          isFirstOrder: props.isFirstOrder,
          lastLoginBonusAt: props.lastLoginBonusAt ?? undefined,
        },
      };
      await this.model.findOneAndUpdate(filter, updateData, { upsert: true });
      this.logger.debug(`UserLevel kaydedildi: userId=${userId}`);
    } catch (err: unknown) {
      this.logger.error(`save failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }
}

@Injectable()
export class MongoXpTransactionRepository implements repo.IXpTransactionRepository {
  constructor(
    @InjectModel('XpTransaction') private readonly model: Model<IXpTransaction>,
  ) { }
  async findById(_id: string) { return null; }
  async findAll() { return []; }
  async delete(_id: string) { return; }

  async save(entity: XpTransaction) {
    const data = { ...entity.getProps(), id: entity.id.toString() };
    const newId = new Types.ObjectId().toString();
    await this.model.create([{ _id: newId, ...data }]);
  }

  async findByUserId(userId: string, skip: number, take: number) {
    const raws = await this.model.find({ userId }).skip(skip).limit(take).sort({ createdAt: -1 }).lean();
    return raws.map(r => (XpTransaction as unknown as { create: (d: unknown, id: string) => XpTransaction }).create(r, r.id));
  }

  async sumSpentInPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const agg = await this.model.aggregate([
      { $match: { userId, createdAt: { $gte: startDate, $lte: endDate }, amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return agg[0]?.total || 0;
  }
}

@Injectable()
export class MongoXpBatchRepository implements repo.IXpBatchRepository {
  constructor(
    @InjectModel('XpBatch') private readonly model: Model<IXpBatch>,
  ) { }
  async findById(_id: string) { return null; }
  async findAll() { return []; }
  async delete(_id: string) { return; }

  async save(entity: XpBatch) {
    const data = LoyaltyMappers.xpBatchToPersistence(entity);
    const id = entity.id.toString();
    await this.model.findOneAndUpdate(
      { id },
      { $set: { ...data, id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async findAvailableBatches(accountId: string) {
    const raws = await this.model
      .find({ accountId, currentBalance: { $gt: 0 }, expiresAt: { $gt: new Date() }, isBurned: false })
      .sort({ createdAt: 1 })
      .lean();
    return raws.map(raw => LoyaltyMappers.xpBatchToDomain(raw as unknown as Parameters<typeof LoyaltyMappers.xpBatchToDomain>[0]));
  }

  async findExpiredBatches(now: Date) {
    const raws = await this.model.find({ expiresAt: { $lte: now }, isBurned: false }).lean();
    return raws.map(raw => LoyaltyMappers.xpBatchToDomain(raw as unknown as Parameters<typeof LoyaltyMappers.xpBatchToDomain>[0]));
  }
}

@Injectable()
export class MongoMissionRepository implements repo.IMissionRepository {
  constructor(
    @InjectModel('Mission') private readonly model: Model<IMission>,
  ) { }
  async findById(_id: string) { return null; }
  async findAll() { return []; }
  async delete(_id: string) { return; }

  async save(entity: Mission) {
    const d = { ...entity.getProps(), id: entity.id.toString() };
    await this.model.findOneAndUpdate({ id: d.id }, { $set: d }, { upsert: true, setDefaultsOnInsert: true });
  }

  async findActive() {
    const rs = await this.model.find({ isActive: true }).lean();
    return rs.map(r => (Mission as unknown as { create: (d: unknown, id: string) => Mission }).create(r, r.id));
  }
}

@Injectable()
export class MongoUserMissionRepository implements repo.IUserMissionRepository {
  constructor(
    @InjectModel('UserMission') private readonly model: Model<IUserMission>,
  ) { }
  async findById(_id: string) { return null; }
  async findAll() { return []; }
  async delete(_id: string) { return; }

  async save(entity: UserMission) {
    const props = entity.getProps();
    const data = {
      userId: props.userId, missionId: props.missionId, status: props.status,
      progress: props.progress, completedAt: props.completedAt, claimedAt: props.claimedAt,
    };
    await this.model.findOneAndUpdate(
      { userId: props.userId, missionId: props.missionId },
      { $set: data, $setOnInsert: { id: entity.id.toString() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findByUserId(userId: string) {
    const rs = await this.model.find({ userId }).lean();
    return rs.map(r => (UserMission as unknown as { create: (d: unknown, id: string) => UserMission }).create(r, r.id));
  }

  async findOne(userId: string, missionId: string) {
    const r = await this.model.findOne({ userId, missionId }).lean();
    return r ? (UserMission as unknown as { create: (d: unknown, id: string) => UserMission }).create(r, r.id) : null;
  }
}

@Injectable()
export class MongoMilestoneTrackerRepository implements repo.IMilestoneTrackerRepository {
  constructor(
    @InjectModel('MilestoneTracker') private readonly model: Model<IMilestoneTracker>,
  ) { }
  async findById(_id: string) { return null; }
  async findAll() { return []; }
  async delete(_id: string) { return; }

  async findByUserId(userId: string) {
    const r = await this.model.findOne({ userId }).lean();
    return r
      ? (MilestoneTracker as unknown as { create: (d: unknown, id: string) => MilestoneTracker }).create(
        { ...r, monthlySpendTotal: parseFloat((r as Record<string, unknown>).monthlySpendTotal?.toString() ?? '0') },
        r.id,
      )
      : null;
  }

  async save(entity: MilestoneTracker) {
    const props = entity.getProps();
    const data = { ...props, id: entity.id.toString() };
    await this.model.findOneAndUpdate(
      { userId: props.userId },
      { $set: data },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
}
