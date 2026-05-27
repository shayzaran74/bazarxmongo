// apps/backend/src/modules/content/domain/entities/home-banner.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface HomeBannerProps {
  title: string;
  description?: string;
  order: number;
  buttonText?: string;
  image: string;
  isActive: boolean;
  link?: string;
  platform: string;
  subtitle?: string;
  tag?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class HomeBanner extends AggregateRoot<HomeBannerProps> {
  private constructor(props: HomeBannerProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<HomeBannerProps, 'createdAt' | 'updatedAt'>, id?: string): HomeBanner {
    return new HomeBanner({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public isVisible(): boolean {
    if (!this.props.isActive) return false;
    const now = new Date();
    if (this.props.startDate && this.props.startDate > now) return false;
    if (this.props.endDate && this.props.endDate < now) return false;
    return true;
  }
}
