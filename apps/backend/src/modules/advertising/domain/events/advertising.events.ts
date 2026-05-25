// apps/backend/src/modules/advertising/domain/events/advertising.events.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class CampaignCreatedEvent extends DomainEvent {
  public readonly eventName = 'advertising.campaign.created';
  constructor(public readonly campaignId: string, public readonly vendorId: string) {
    super(campaignId);
  }
}

export class CampaignApprovedEvent extends DomainEvent {
  public readonly eventName = 'advertising.campaign.approved';
  constructor(public readonly campaignId: string, public readonly vendorId: string) {
    super(campaignId);
  }
}

export class CampaignExhaustedEvent extends DomainEvent {
  public readonly eventName = 'advertising.campaign.exhausted';
  constructor(public readonly campaignId: string, public readonly vendorId: string) {
    super(campaignId);
  }
}

export class CampaignExpiredEvent extends DomainEvent {
  public readonly eventName = 'advertising.campaign.expired';
  constructor(
    public readonly campaignId: string,
    public readonly vendorId: string,
    public readonly targetListingId?: string,
    public readonly targetSlotType?: string,
  ) {
    super(campaignId);
  }
}

export class ImpressionRecordedEvent extends DomainEvent {
  public readonly eventName = 'advertising.impression.recorded';
  constructor(
    public readonly campaignId: string,
    public readonly type: 'impression' | 'click',
    public readonly cost: number
  ) {
    super(campaignId);
  }
}
