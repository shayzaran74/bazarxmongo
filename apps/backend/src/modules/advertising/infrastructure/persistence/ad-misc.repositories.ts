// apps/backend/src/modules/advertising/infrastructure/persistence/ad-misc.repositories.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IAdSlotRepository, IAdCampaignMetricRepository, ISideAdRepository } from '../../domain/repositories/ad-misc.repositories.interface';
import { AdSlot, AdCampaignMetric, SideAd } from '../../domain/entities/ad-misc.entities';
import { AdSlotType } from '../../domain/enums/advertising.enums';

@Injectable()
export class PrismaAdSlotRepository implements IAdSlotRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; }
  async findAll() { return []; }
  async delete(id: string) { await this.prisma.adSlot.delete({ where: { id } }); }
  async save(e: AdSlot) { 
    const d = { ...e.getProps(), id: e.id.toString(), slotType: e.getProps().slotType as any, platform: e.getProps().platform as any };
    await this.prisma.adSlot.upsert({ where: { id: e.id.toString() }, create: d, update: d });
  }
  async findByType(slotType: AdSlotType, platform: string) {
    const r = await this.prisma.adSlot.findUnique({ where: { slotType_platform: { slotType: slotType as any, platform: platform as any } } });
    return r ? (AdSlot as any).create(r, r.id) : null;
  }
}

@Injectable()
export class PrismaSideAdRepository implements ISideAdRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) {
    const r = await this.prisma.sideAd.findUnique({ where: { id } });
    return r ? (SideAd as any).create(r, r.id) : null;
  }
  async findAllActive() {
    const rs = await this.prisma.sideAd.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
    return rs.map(r => (SideAd as any).create(r, r.id));
  }
  async save(e: SideAd) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await this.prisma.sideAd.upsert({ where: { id: e.id.toString() }, create: d, update: d });
  }
  async findAll() { return []; }
  async delete(id: string) { await this.prisma.sideAd.delete({ where: { id } }); }
}

@Injectable()
export class PrismaAdCampaignMetricRepository implements IAdCampaignMetricRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string) { return null; }
  async findAll() { return []; }
  async delete(id: string) { return; }
  async save(e: AdCampaignMetric) { return; }
  async findByCampaignId(campaignId: string, startDate: Date, endDate: Date) {
    const rs = await this.prisma.adCampaignMetric.findMany({
      where: { adCampaignId: campaignId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    });
    return rs.map(r => (AdCampaignMetric as any).create({ ...r, ctr: Number(r.ctr), spend: Number(r.spend) }, r.id));
  }
}
