// apps/backend/src/modules/loyalty/infrastructure/persistence/loyalty-rules.repositories.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IXpDistributionRuleRepository, IXpSpendingLimitRuleRepository } from '../../domain/repositories/loyalty.repository.interfaces';
import { XpDistributionRule, XpSpendingLimitRule } from '../../domain/entities/loyalty-rules.entities';

@Injectable()
export class PrismaXpDistributionRuleRepository implements IXpDistributionRuleRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; } async findAll() { return []; } async delete(id: string) { return; }
  async save(e: XpDistributionRule) { 
    const d = { ...e.getProps(), id: e.id.toString(), commissionRate: e.getProps().commissionRate as any, adSpendRate: e.getProps().adSpendRate as any, serviceRate: e.getProps().serviceRate as any, vendorTier: e.getProps().vendorTier as any };
    await this.prisma.xpDistributionRule.upsert({ where: { id: d.id }, create: d, update: d });
  }
  async findAllActive() {
    const rs = await this.prisma.xpDistributionRule.findMany({ where: { isActive: true }, orderBy: { priority: 'desc' } });
    return rs.map(r => (XpDistributionRule as any).create({ ...r, commissionRate: Number(r.commissionRate), adSpendRate: Number(r.adSpendRate), serviceRate: Number(r.serviceRate) }, r.id));
  }
}

@Injectable()
export class PrismaXpSpendingLimitRuleRepository implements IXpSpendingLimitRuleRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; } async findAll() { return []; } async delete(id: string) { return; }
  async save(e: XpSpendingLimitRule) {
    const d = { ...e.getProps(), id: e.id.toString(), maxSpendPerTx: e.getProps().maxSpendPerTx as any, monthlyVolumeLimit: e.getProps().monthlyVolumeLimit as any, dailyLimit: e.getProps().dailyLimit as any, weeklyLimit: e.getProps().weeklyLimit as any, monthlyLimit: e.getProps().monthlyLimit as any, maxSpendPercentage: e.getProps().maxSpendPercentage as any, minCartAmount: e.getProps().minCartAmount as any, xpToTlRate: e.getProps().xpToTlRate as any, vendorTier: e.getProps().vendorTier as any, loyaltyTier: e.getProps().loyaltyTier as any };
    await this.prisma.xpSpendingLimitRule.upsert({ where: { id: d.id }, create: d, update: d });
  }
  async findApplicable(vendorTier?: string, loyaltyTier?: string) {
    const rs = await this.prisma.xpSpendingLimitRule.findMany({
      where: { isActive: true, OR: [{ vendorTier: vendorTier as any }, { loyaltyTier: loyaltyTier as any }, { vendorTier: null, loyaltyTier: null }] },
      orderBy: { priority: 'desc' }
    });
    return rs.map(r => (XpSpendingLimitRule as any).create({ ...r, maxSpendPerTx: Number(r.maxSpendPerTx), monthlyVolumeLimit: Number(r.monthlyVolumeLimit), dailyLimit: Number(r.dailyLimit), weeklyLimit: Number(r.weeklyLimit), monthlyLimit: Number(r.monthlyLimit), maxSpendPercentage: Number(r.maxSpendPercentage), minCartAmount: Number(r.minCartAmount), xpToTlRate: Number(r.xpToTlRate) }, r.id));
  }
}
