// apps/backend/src/modules/loyalty/infrastructure/persistence/loyalty-rules.repositories.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IXpDistributionRuleRepository,
  IXpSpendingLimitRuleRepository,
} from '../../domain/repositories/loyalty.repository.interfaces';
import { XpDistributionRule, XpSpendingLimitRule } from '../../domain/entities/loyalty-rules.entities';
import { IXpDistributionRule, IXpSpendingLimitRule } from '@barterborsa/shared-persistence';

@Injectable()
export class PrismaXpDistributionRuleRepository implements IXpDistributionRuleRepository {
  constructor(
    @InjectModel('XpDistributionRule') private readonly model: Model<IXpDistributionRule>,
  ) {}
  async findById(_id: string) { return null; }
  async findAll() { return []; }
  async delete(_id: string) { return; }

  async save(e: XpDistributionRule) {
    const d = {
      ...e.getProps(), id: e.id.toString(),
      commissionRate: e.getProps().commissionRate,
      adSpendRate:    e.getProps().adSpendRate,
      serviceRate:    e.getProps().serviceRate,
      vendorTier:     e.getProps().vendorTier,
    };
    await this.model.findOneAndUpdate({ id: d.id }, { $set: d }, { upsert: true, setDefaultsOnInsert: true });
  }

  async findAllActive() {
    const rs = await this.model.find({ isActive: true }).sort({ priority: -1 }).lean();
    return rs.map(r =>
      (XpDistributionRule as unknown as { create: (d: unknown, id: string) => XpDistributionRule }).create({
        ...r,
        commissionRate: parseFloat((r as Record<string, unknown>).commissionRate?.toString() ?? '0'),
        adSpendRate:    parseFloat((r as Record<string, unknown>).adSpendRate?.toString() ?? '0'),
        serviceRate:    parseFloat((r as Record<string, unknown>).serviceRate?.toString() ?? '0'),
      }, r.id),
    );
  }
}

@Injectable()
export class PrismaXpSpendingLimitRuleRepository implements IXpSpendingLimitRuleRepository {
  constructor(
    @InjectModel('XpSpendingLimitRule') private readonly model: Model<IXpSpendingLimitRule>,
  ) {}
  async findById(_id: string) { return null; }
  async findAll() { return []; }
  async delete(_id: string) { return; }

  async save(e: XpSpendingLimitRule) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.model.findOneAndUpdate({ id: d.id }, { $set: d }, { upsert: true, setDefaultsOnInsert: true });
  }

  async findApplicable(vendorTier?: string, loyaltyTier?: string) {
    const rs = await this.model
      .find({
        isActive: true,
        $or: [
          { vendorTier },
          { loyaltyTier },
          { vendorTier: null, loyaltyTier: null },
        ],
      })
      .sort({ priority: -1 })
      .lean();

    const toNum = (v: unknown) => parseFloat((v?.toString()) ?? '0');

    return rs.map(r =>
      (XpSpendingLimitRule as unknown as { create: (d: unknown, id: string) => XpSpendingLimitRule }).create({
        ...r,
        maxSpendPerTx:     toNum((r as Record<string, unknown>).maxSpendPerTx),
        monthlyVolumeLimit:toNum((r as Record<string, unknown>).monthlyVolumeLimit),
        dailyLimit:        toNum((r as Record<string, unknown>).dailyLimit),
        weeklyLimit:       toNum((r as Record<string, unknown>).weeklyLimit),
        monthlyLimit:      toNum((r as Record<string, unknown>).monthlyLimit),
        maxSpendPercentage:toNum((r as Record<string, unknown>).maxSpendPercentage),
        minCartAmount:     toNum((r as Record<string, unknown>).minCartAmount),
        xpToTlRate:        toNum((r as Record<string, unknown>).xpToTlRate),
      }, r.id),
    );
  }
}

// Alias exports for MongoDB-migrated repositories
export const MongoXpDistributionRuleRepository = PrismaXpDistributionRuleRepository;
export const MongoXpSpendingLimitRuleRepository = PrismaXpSpendingLimitRuleRepository;