// apps/backend/src/modules/barter/infrastructure/persistence/mappers/surplus-item.mapper.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SurplusItem, SurplusItemProps } from '../../../domain/entities/surplus-item.entity';
import { SurplusStatus } from '../../../domain/enums/surplus-status.enum';
import { PilotCity } from '../../../domain/enums/pilot-city.enum';

type SurplusItemRaw = Prisma.SurplusItemGetPayload<object>;

@Injectable()
export class SurplusItemMapper {
  toDomain(raw: SurplusItemRaw): SurplusItem {
    const props: SurplusItemProps = {
      companyId: raw.companyId,
      title: raw.title,
      description: raw.description ?? undefined,
      category: raw.category,
      materialType: raw.materialType ?? undefined,
      quantity: raw.quantity,
      blockedQuantity: raw.blockedQuantity,
      unit: raw.unit,
      minTradeQuantity: raw.minTradeQuantity ?? undefined,
      unitPrice: raw.unitPrice ?? undefined,
      wantedCategories: raw.wantedCategories ?? undefined,
      tradeModes: raw.tradeModes ?? undefined,
      images: raw.images ?? undefined,
      location: raw.location ?? undefined,
      city: (raw.city as PilotCity) ?? undefined,
      status: raw.status as SurplusStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
    return SurplusItem.createFrom(props, raw.id);
  }

  toPersistence(domain: SurplusItem): Record<string, unknown> {
    const props = domain.getProps();
    return {
      id: domain.id,
      companyId: props.companyId,
      title: props.title,
      description: props.description,
      category: props.category,
      quantity: props.quantity,
      blockedQuantity: props.blockedQuantity,
      unit: props.unit,
      unitPrice: props.unitPrice,
      city: props.city,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
