// apps/backend/src/modules/barter/infrastructure/persistence/mappers/surplus-item.mapper.ts

import { Injectable } from '@nestjs/common';
import { SurplusItem } from '../../../domain/entities/surplus-item.entity';
import { SurplusStatus } from '../../../domain/enums/surplus-status.enum';
import { PilotCity } from '../../../domain/enums/pilot-city.enum';

@Injectable()
export class SurplusItemMapper {
  toDomain(raw: any): SurplusItem {
    return (SurplusItem as any).createFrom({
      ...raw,
      status: raw.status as SurplusStatus,
      city: raw.city as PilotCity,
    }, raw.id);
  }

  toPersistence(domain: SurplusItem): any {
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
