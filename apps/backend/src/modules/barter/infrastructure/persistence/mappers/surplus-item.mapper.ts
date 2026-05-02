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
      companyId:          raw.companyId,
      title:              raw.title,
      description:        raw.description ?? undefined,
      category:           raw.category,
      materialType:       raw.materialType ?? undefined,
      quantity:           raw.quantity,
      blockedQuantity:    raw.blockedQuantity,
      unit:               raw.unit,
      minTradeQuantity:   raw.minTradeQuantity ?? undefined,
      unitPrice:          raw.unitPrice ?? undefined,
      wantedCategories:   raw.wantedCategories ?? undefined,
      tradeModes:         raw.tradeModes ?? undefined,
      technicalSpecs:     (raw as unknown as { technicalSpecs?: unknown }).technicalSpecs ?? undefined,
      images:             raw.images ?? undefined,
      location:           raw.location ?? undefined,
      city:               (raw.city as PilotCity) ?? undefined,
      status:             raw.status as SurplusStatus,
      rejectionReason:    (raw as unknown as { rejectionReason?: string }).rejectionReason ?? undefined,
      approvedBy:         (raw as unknown as { approvedBy?: string }).approvedBy ?? undefined,
      reactivationCount:  raw.reactivationCount,
      lastReactivatedAt:  raw.lastReactivatedAt ?? undefined,
      createdAt:          raw.createdAt,
      updatedAt:          raw.updatedAt,
    };
    return SurplusItem.createFrom(props, raw.id);
  }

  toPersistence(domain: SurplusItem): Record<string, unknown> {
    const props = domain.getProps();
    return {
      id:                 domain.id,
      companyId:          props.companyId,
      title:              props.title,
      description:        props.description,
      category:           props.category,
      materialType:       props.materialType,
      quantity:           props.quantity,
      blockedQuantity:    props.blockedQuantity,
      unit:               props.unit,
      unitPrice:          props.unitPrice,
      wantedCategories:   props.wantedCategories,
      tradeModes:         props.tradeModes,
      technicalSpecs:     props.technicalSpecs,
      images:             props.images,
      location:           props.location,
      city:               props.city,
      status:             props.status,
      rejectionReason:    props.rejectionReason,
      approvedBy:         props.approvedBy,
      reactivationCount:  props.reactivationCount,
      lastReactivatedAt:  props.lastReactivatedAt,
      createdAt:          props.createdAt,
      updatedAt:          props.updatedAt,
    };
  }
}
