// apps/backend/src/modules/barter/domain/entities/wanted-item.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { WantedItemStatus } from '../enums/wanted-item-status.enum';
import { WantedItemType } from '../enums/wanted-item-type.enum';

export interface WantedItemProps {
  companyId?: string;
  userId?: string;
  keywords: string[];
  description?: string;
  categoryId: string;
  minPrice?: number;
  maxPrice?: number;
  status: WantedItemStatus;
  type: WantedItemType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class WantedItem extends AggregateRoot<WantedItemProps> {
  private constructor(props: WantedItemProps, id?: string) {
    super(props, id);
  }

  public static create(
    categoryId: string,
    keywords: string[],
    companyId?: string,
    userId?: string,
    type: WantedItemType = WantedItemType.PRODUCT
  ): WantedItem {
    const now = new Date();
    return new WantedItem({
      categoryId,
      keywords,
      companyId,
      userId,
      type,
      status: WantedItemStatus.ACTIVE,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }
}