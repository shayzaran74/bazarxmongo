// apps/backend/src/modules/advertising/domain/entities/ad-misc.entities.ts

import { Entity, AggregateRoot } from '@barterborsa/shared-core';
import { AdSlotType } from '../enums/advertising.enums';

export interface AdSlotProps {
  slotType: AdSlotType;
  platform: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export class AdSlot extends AggregateRoot<AdSlotProps> {
  private constructor(props: AdSlotProps, id?: string) { super(props, id); }
  public static create(props: Omit<AdSlotProps, 'createdAt'>, id?: string): AdSlot {
    return new AdSlot({ ...props, createdAt: new Date() }, id);
  }
}

export interface AdCampaignMetricProps {
  adCampaignId: string;
  date: Date;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  sales: number;
}

export class AdCampaignMetric extends AggregateRoot<AdCampaignMetricProps> {
  private constructor(props: AdCampaignMetricProps, id?: string) { super(props, id); }
  public static create(props: AdCampaignMetricProps, id?: string): AdCampaignMetric {
    return new AdCampaignMetric(props, id);
  }
}

export interface SideAdProps {
  side: string;
  title: string;
  subtitle?: string;
  image?: string;
  emoji?: string;
  link?: string;
  order: number;
  ecosystems: string[];
  category?: string;
  isActive: boolean;
  createdAt: Date;
}

export class SideAd extends AggregateRoot<SideAdProps> {
  private constructor(props: SideAdProps, id?: string) { super(props, id); }
  public static create(props: Omit<SideAdProps, 'createdAt'>, id?: string): SideAd {
    return new SideAd({ ...props, createdAt: new Date() }, id);
  }
}
