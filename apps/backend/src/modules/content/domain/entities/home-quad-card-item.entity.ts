// apps/backend/src/modules/content/domain/entities/home-quad-card-item.entity.ts

import { Entity } from '@barterborsa/shared-core';

export interface HomeQuadCardItemProps {
  title: string;
  image: string;
  link?: string;
  productId?: string;
  order: number;
  quadCardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class HomeQuadCardItem extends Entity<HomeQuadCardItemProps> {
  private constructor(props: HomeQuadCardItemProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<HomeQuadCardItemProps, 'createdAt' | 'updatedAt'>, id?: string): HomeQuadCardItem {
    return new HomeQuadCardItem({ ...props, createdAt: new Date(), updatedAt: new Date() }, id);
  }
}
