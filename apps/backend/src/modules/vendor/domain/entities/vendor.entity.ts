// apps/backend/src/modules/vendor/domain/entities/vendor.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { VendorStatus } from '../enums/vendor-status.enum';
import { VendorTier } from '../enums/vendor-tier.enum';
import { VendorSlug } from '../value-objects/vendor-slug.vo';
import { VendorRegisteredEvent } from '../events/vendor-registered.event';
import { VendorApprovedEvent } from '../events/vendor-approved.event';
import { VendorRejectedEvent } from '../events/vendor-rejected.event';
import { VendorSuspendedEvent } from '../events/vendor-suspended.event';

export interface VendorProps {
  userId: string;
  companyId: string;
  status: VendorStatus;
  tier: VendorTier;
  slug: VendorSlug;
  isVerified: boolean;
  rejectionReason?: string;
  suspensionReason?: string;
  ecosystemId?: string;
  membershipTierId?: string;
  lastAuditAt?: Date;
  verifiedAt?: Date;
}

export class Vendor extends AggregateRoot<VendorProps> {
  protected constructor(props: VendorProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: VendorProps, id: string): Vendor {
    return new Vendor(props, id);
  }

  public static create(userId: string, companyId: string, slug: VendorSlug, storeName: string): Vendor {
    const vendor = new Vendor({
      userId,
      companyId,
      slug,
      status: VendorStatus.PENDING,
      tier: VendorTier.CORE,
      isVerified: false,
    });

    vendor.addDomainEvent(new VendorRegisteredEvent(vendor.id, userId, companyId, storeName));
    return vendor;
  }

  public approve(): void {
    this.props.status = VendorStatus.APPROVED;
    this.props.isVerified = true;
    this.props.verifiedAt = new Date();
    this._updatedAt = new Date();
    
    this.addDomainEvent(new VendorApprovedEvent(this.id, this.props.userId, this.props.companyId));
  }

  public reject(reason: string): void {
    this.props.status = VendorStatus.REJECTED;
    this.props.rejectionReason = reason;
    this._updatedAt = new Date();

    this.addDomainEvent(new VendorRejectedEvent(this.id, reason));
  }

  public suspend(reason: string): void {
    this.props.status = VendorStatus.SUSPENDED;
    this.props.suspensionReason = reason;
    this._updatedAt = new Date();

    this.addDomainEvent(new VendorSuspendedEvent(this.id, reason));
  }

  public upgradeTier(newTier: VendorTier): void {
    this.props.tier = newTier;
    this._updatedAt = new Date();
  }

  public joinEcosystem(ecosystemId: string): void {
    this.props.ecosystemId = ecosystemId;
    this._updatedAt = new Date();
  }

  public isActive(): boolean {
    return this.props.status === VendorStatus.APPROVED;
  }

  // Getters
  get userId(): string { return this.props.userId; }
  get companyId(): string { return this.props.companyId; }
  get status(): VendorStatus { return this.props.status; }
  get tier(): VendorTier { return this.props.tier; }
  get slug(): VendorSlug { return this.props.slug; }
}
