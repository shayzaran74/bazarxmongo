// apps/backend/src/modules/barter/domain/entities/surplus-item.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';
import { SurplusStatus } from '../enums/surplus-status.enum';
import { PilotCity } from '../enums/pilot-city.enum';

export interface SurplusItemProps {
  companyId: string;
  title: string;
  description?: string;
  category: string;
  materialType?: string;
  quantity: Prisma.Decimal;
  blockedQuantity: Prisma.Decimal;
  unit: string;
  minTradeQuantity?: Prisma.Decimal;
  unitPrice?: Prisma.Decimal;
  wantedCategories?: unknown;
  tradeModes?: unknown;
  images?: unknown;
  location?: string;
  city?: PilotCity;
  status: SurplusStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class SurplusItem extends AggregateRoot<SurplusItemProps> {
  private constructor(props: SurplusItemProps, id?: string) {
    super(props, id);
  }

  // Persistence'dan yeniden oluşturmak için (domain doğrulaması atlanır)
  public static createFrom(props: SurplusItemProps, id: string): SurplusItem {
    return new SurplusItem(props, id);
  }

  public static create(
    companyId: string,
    title: string,
    category: string,
    quantity: Prisma.Decimal,
    unit: string,
    city: PilotCity,
    description?: string,
    unitPrice?: Prisma.Decimal
  ): SurplusItem {
    const now = new Date();
    return new SurplusItem({
      companyId,
      title,
      description,
      category,
      quantity,
      blockedQuantity: new Prisma.Decimal(0),
      unit,
      unitPrice,
      city,
      status: SurplusStatus.ACTIVE, // Initially active for simplicity
      createdAt: now,
      updatedAt: now,
    });
  }

  public blockQuantity(amount: Prisma.Decimal): void {
    const remaining = this.props.quantity.minus(this.props.blockedQuantity);
    if (remaining.lt(amount)) {
      throw new Error('Insufficient surplus quantity');
    }
    this.props.blockedQuantity = this.props.blockedQuantity.plus(amount);
  }

  public unblockQuantity(amount: Prisma.Decimal): void {
    this.props.blockedQuantity = this.props.blockedQuantity.minus(amount);
  }
}
