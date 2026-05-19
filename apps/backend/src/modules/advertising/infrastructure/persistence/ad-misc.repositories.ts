// apps/backend/src/modules/advertising/infrastructure/persistence/ad-misc.repositories.ts

import { Injectable } from '@nestjs/common';
import { AdSlot } from '@barterborsa/shared-persistence/schemas/backend/adSlot.schema';
import { SideAd } from '@barterborsa/shared-persistence/schemas/backend/sideAd.schema';
import { AdCampaignMetric } from '@barterborsa/shared-persistence/schemas/backend/adCampaignMetric.schema';
import { IAdSlotRepository, IAdCampaignMetricRepository, ISideAdRepository } from '../../domain/repositories/ad-misc.repositories.interface';
import { AdSlot as AdSlotEntity, AdCampaignMetric as AdMetricEntity, SideAd as SideAdEntity } from '../../domain/entities/ad-misc.entities';
import { AdSlotType } from '../../domain/enums/advertising.enums';

@Injectable()
export class MongoAdSlotRepository implements IAdSlotRepository {
  async findById(id: string) { return null; }
  async findAll() { return []; }
  async delete(id: string) { await AdSlot.deleteOne({ id }).exec(); }
  async save(e: AdSlotEntity) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await AdSlot.updateOne({ id: e.id.toString() }, { $set: d }, { upsert: true }).exec();
  }
  async findByType(slotType: AdSlotType, platform: string) {
    const r = await AdSlot.findOne({ slotType: slotType as any, platform: platform as any }).exec();
    return r ? (AdSlotEntity as any).create(r, r.id) : null;
  }
}

@Injectable()
export class MongoSideAdRepository implements ISideAdRepository {
  async findById(id: string) {
    const r = await SideAd.findOne({ id }).exec();
    return r ? (SideAdEntity as any).create(r, r.id) : null;
  }
  async findAllActive() {
    const rs = await SideAd.find({ isActive: true }).sort({ order: 'asc' }).exec();
    return rs.map((r: { id: string; side?: string; title?: string; subtitle?: string; image?: string; emoji?: string; link?: string; order?: number; category?: string; isActive: boolean }) => (SideAdEntity as any).create(r, r.id));
  }
  async save(e: SideAdEntity) {
    const d = { ...e.getProps(), id: e.id.toString() };
    await SideAd.updateOne({ id: e.id.toString() }, { $set: d }, { upsert: true }).exec();
  }
  async findAll() { return []; }
  async delete(id: string) { await SideAd.deleteOne({ id }).exec(); }
}

@Injectable()
export class MongoAdCampaignMetricRepository implements IAdCampaignMetricRepository {
  async findById(id: string) { return null; }
  async findAll() { return []; }
  async delete(id: string) { return; }
  async save(e: AdMetricEntity) { return; }
  async findByCampaignId(campaignId: string, startDate: Date, endDate: Date) {
    const rs = await AdCampaignMetric.find({
      adCampaignId: campaignId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 'asc' }).exec();
    return rs.map((r: { id: string; ctr: any; spend: any; toObject(): object }) => (AdMetricEntity as any).create({ ...r.toObject(), ctr: Number(r.ctr), spend: Number(r.spend) }, r.id));
  }
}
