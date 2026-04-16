// apps/backend/src/modules/content/domain/entities/home-quad-card.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { HomeQuadCardItem } from './home-quad-card-item.entity';

export interface HomeQuadCardProps {
  title: string;
  order: number;
  isActive: boolean;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
  items?: HomeQuadCardItem[];
}

export class HomeQuadCard extends AggregateRoot<HomeQuadCardProps> {
  private constructor(props: HomeQuadCardProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<HomeQuadCardProps, 'createdAt' | 'updatedAt'>, id?: string): HomeQuadCard {
    return new HomeQuadCard({
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
}
