// apps/backend/src/modules/advertising/domain/entities/ad-campaign.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { AdStatus, AdType, BillingModel, PricingModel, TargetRole } from '../enums/advertising.enums';
import {
  CampaignCreatedEvent,
  CampaignApprovedEvent,
  CampaignExhaustedEvent,
  CampaignExpiredEvent,
} from '../events/advertising.events';

export interface AdCampaignProps {
  name: string;
  platform: string;
  budget: number;
  remainingBudget: number;
  adStatus: AdStatus;
  adType: AdType;
  bidAmount: number;
  billingModel: BillingModel;
  pricingModel: PricingModel;
  startDate: Date;
  endDate: Date;
  vendorId?: string;
  creatorId?: string;
  adSource?: 'PAID' | 'MENU_TAAHHUT';
  targetListingId?: string;
  targetSlotType?: string;
  imageUrl?: string;
  linkUrl?: string;
  targetCategories: string[];
  targetKeywords: string[];
  targetRole: TargetRole;
  targetCities: string[];
  targetDistricts: string[];
  targetSlots: string[];
  targetUrl?: string;
  qualityScore: number;
  historicCTR: number;
  maxBidPerClick?: number;
  maxBidPerMille?: number;
  mediaUrl?: string;
  negativeKeywords: string[];
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AdCampaign extends AggregateRoot<AdCampaignProps> {
  private constructor(props: AdCampaignProps, id?: string) {
    super(props, id);
  }

  public static reconstitute(props: AdCampaignProps, id: string): AdCampaign {
    return new AdCampaign(props, id);
  }

  public static create(props: Omit<AdCampaignProps, 'createdAt' | 'updatedAt' | 'adStatus' | 'remainingBudget' | 'qualityScore' | 'historicCTR'>, id?: string): AdCampaign {
    const campaign = new AdCampaign({
      ...props,
      adStatus: AdStatus.PENDING,
      remainingBudget: props.budget,
      qualityScore: 1.0,
      historicCTR: 0.01,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);

    campaign.addDomainEvent(new CampaignCreatedEvent(campaign.id.toString(), props.vendorId || 'SYSTEM'));
    return campaign;
  }

  public approve(): void {
    if (this.props.adStatus !== AdStatus.PENDING) throw new DomainException('Only pending campaigns can be approved');
    this.props.adStatus = AdStatus.ACTIVE;
    this.props.updatedAt = new Date();
    this.addDomainEvent(new CampaignApprovedEvent(this.id.toString(), this.props.vendorId || 'SYSTEM'));
  }

  public reject(reason: string): void {
    this.props.adStatus = AdStatus.REJECTED;
    this.props.rejectionReason = reason;
    this.props.updatedAt = new Date();
  }

  public pause(): void {
    if (this.props.adStatus === AdStatus.ACTIVE) {
      this.props.adStatus = AdStatus.PAUSED;
      this.props.updatedAt = new Date();
    }
  }

  public resume(): void {
    if (this.props.adStatus === AdStatus.PAUSED && this.hasBudget()) {
      this.props.adStatus = AdStatus.ACTIVE;
      this.props.updatedAt = new Date();
    }
  }

  public exhaust(): void {
    if (this.props.remainingBudget <= 0) {
      this.props.adStatus = AdStatus.PAUSED;
      this.props.updatedAt = new Date();
      this.addDomainEvent(new CampaignExhaustedEvent(this.id.toString(), this.props.vendorId || 'SYSTEM'));
    }
  }

  public expire(): void {
    const now = new Date();
    if (this.props.endDate <= now) {
      this.props.adStatus = AdStatus.EXPIRED;
      this.props.updatedAt = new Date();
      this.addDomainEvent(new CampaignExpiredEvent(
        this.id.toString(),
        this.props.vendorId ?? 'SYSTEM',
        this.props.targetListingId,
        this.props.targetSlotType,
      ));
    }
  }

  public recordImpression(cost: number): void {
    this.props.remainingBudget -= cost;
    if (this.props.remainingBudget < 0) this.props.remainingBudget = 0;
    this.exhaust();
  }

  public recordClick(cost: number): void {
    this.props.remainingBudget -= cost;
    if (this.props.remainingBudget < 0) this.props.remainingBudget = 0;
    this.exhaust();
  }

  public hasBudget(): boolean {
    return this.props.remainingBudget > 0;
  }

  public isRunning(): boolean {
    const now = new Date();
    return (
      this.props.adStatus === AdStatus.ACTIVE &&
      this.hasBudget() &&
      this.props.startDate <= now &&
      this.props.endDate >= now
    );
  }
}
