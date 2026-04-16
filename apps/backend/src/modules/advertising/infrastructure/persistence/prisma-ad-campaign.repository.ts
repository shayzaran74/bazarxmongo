// apps/backend/src/modules/advertising/infrastructure/persistence/prisma-ad-campaign.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { AdCampaign } from '../../domain/entities/ad-campaign.entity';
import { AdCampaignMapper } from './mappers/ad-campaign.mapper';
import { AdSlotType, AdStatus } from '../../domain/enums/advertising.enums';

@Injectable()
export class PrismaAdCampaignRepository implements IAdCampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AdCampaign | null> {
    const raw = await this.prisma.adCampaign.findUnique({ where: { id } });
    return raw ? AdCampaignMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<AdCampaign[]> {
    const raws = await this.prisma.adCampaign.findMany();
    return raws.map(AdCampaignMapper.toDomain);
  }

  async save(entity: AdCampaign): Promise<void> {
    const data = AdCampaignMapper.toPersistence(entity);
    await this.prisma.adCampaign.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.adCampaign.delete({ where: { id } });
  }

  async findActiveBySlot(slotType: AdSlotType, platform: string): Promise<AdCampaign[]> {
    const raws = await this.prisma.adCampaign.findMany({
      where: {
        platform: platform as any,
        adStatus: AdStatus.ACTIVE as any,
        adSlots: { some: { adSlot: { slotType: slotType as any } } }
      }
    });
    return raws.map(AdCampaignMapper.toDomain);
  }

  async findByVendorId(vendorId: string): Promise<AdCampaign[]> {
    const raws = await this.prisma.adCampaign.findMany({ where: { vendorId } });
    return raws.map(AdCampaignMapper.toDomain);
  }

  async updateMetric(campaignId: string, type: 'impression' | 'click', cost: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.adCampaignMetric.upsert({
      where: { adCampaignId_date: { adCampaignId: campaignId, date: today } },
      create: {
        adCampaignId: campaignId,
        date: today,
        impressions: type === 'impression' ? 1 : 0,
        clicks: type === 'click' ? 1 : 0,
        spend: cost,
      },
      update: {
        impressions: type === 'impression' ? { increment: 1 } : undefined,
        clicks: type === 'click' ? { increment: 1 } : undefined,
        spend: { increment: cost },
      }
    });
  }
}
