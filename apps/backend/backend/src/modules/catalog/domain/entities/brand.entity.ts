// apps/backend/src/modules/catalog/domain/entities/brand.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Slug } from '../value-objects/slug.vo';
import { BrandStatus } from '../enums/brand-status.enum';

export interface BrandProps {
  name: string;
  slug: Slug;
  icon?: string;
  image?: string;
  description?: string;
  status: BrandStatus;
  isOfficial: boolean;
  isPopular: boolean;
  order: number;
  vendorId?: string;
  rejectionReason?: string;
  approvedAt?: Date;
}

export class Brand extends AggregateRoot<BrandProps> {
  protected constructor(props: BrandProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: BrandProps, id: string): Brand {
    return new Brand(props, id);
  }

  public static create(props: Omit<BrandProps, 'status' | 'isOfficial' | 'isPopular' | 'order' | 'approvedAt' | 'rejectionReason'>): Brand {
    return new Brand({
      ...props,
      status: BrandStatus.PENDING,
      isOfficial: false,
      isPopular: false,
      order: 0,
    });
  }

  public approve(): void {
    this.props.status = BrandStatus.APPROVED;
    this.props.approvedAt = new Date();
    this._updatedAt = new Date();
  }

  public reject(reason: string): void {
    this.props.status = BrandStatus.REJECTED;
    this.props.rejectionReason = reason;
    this._updatedAt = new Date();
  }

  get name(): string { return this.props.name; }
  get slug(): Slug { return this.props.slug; }
  get status(): BrandStatus { return this.props.status; }
}
