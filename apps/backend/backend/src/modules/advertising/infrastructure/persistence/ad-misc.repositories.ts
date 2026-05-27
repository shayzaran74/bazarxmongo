// apps/backend/src/modules/advertising/infrastructure/persistence/ad-misc.repositories.ts

import { Injectable } from '@nestjs/common';
import { AdSlot } from '@barterborsa/shared-persistence/schemas/backend/adSlot.schema';
import { SideAd } from '@barterborsa/shared-persistence/schemas/backend/sideAd.schema';
import { AdCampaignMetric } from '@barterborsa/shared-persistence/schemas/backend/adCampaignMetric.schema';
import { IAdSlotRepository, IAdCampaignMetricRepository, ISideAdRepository } from '../../domain/repositories/ad-misc.repositories.interface';
import { AdSlot as AdSlotEntity, AdCampaignMetric as AdMetricEntity, SideAd as SideAdEntity, AdSlotProps } from '../../domain/entities/ad-misc.entities';
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
    const r = await AdSlot.findOne({ slotType, platform }).exec();
    return r ? AdSlotEntity.create(r as unknown as Omit<AdSlotProps, 'createdAt'>, r.id) : null;
  }
}

@Injectable()
export class MongoSideAdRepository implements ISideAdRepository {
  async findById(id: string) {
    const r = await SideAd.findOne({ id }).exec();
    return r ? SideAdEntity.create({
      side: r.side,
      title: r.title,
      subtitle: r.subtitle,
      image: r.image,
      emoji: r.emoji,
      link: r.link,
      order: r.order ?? 0,
      ecosystems: [],
      category: r.category,
      isActive: r.isActive,
    }, r.id) : null;
  }
  async findAllActive() {
    const rs = await SideAd.find({ isActive: true }).sort({ order: 'asc' }).exec();
    return rs.map((r) => SideAdEntity.create({
      side: r.side ?? '',
      title: r.title ?? '',
      subtitle: r.subtitle,
      image: r.image,
      emoji: r.emoji,
      link: r.link,
      order: r.order ?? 0,
      ecosystems: [],
      category: r.category,
      isActive: r.isActive,
    }, r.id));
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
    return rs.map((r) => AdMetricEntity.create({
      adCampaignId: r.adCampaignId,
      date: r.date,
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: Number(r.ctr),
      spend: Number(r.spend),
      sales: r.sales,
    }, r.id));
  }
}
