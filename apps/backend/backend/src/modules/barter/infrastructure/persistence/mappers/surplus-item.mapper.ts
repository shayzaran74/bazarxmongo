// apps/backend/src/modules/barter/infrastructure/persistence/mappers/surplus-item.mapper.ts
// SurplusItemMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ISurplusItem } from '../../../../../../../../packages/shared/shared-persistence/src/schemas/backend/surplusItem.schema';
import { SurplusItem, SurplusItemProps } from '../../../domain/entities/surplus-item.entity';
import { SurplusStatus } from '../../../domain/enums/surplus-status.enum';
import { PilotCity } from '../../../domain/enums/pilot-city.enum';

export interface SurplusItemDocument extends ISurplusItem {
  _id?: string;
}

@Injectable()
export class SurplusItemMapper {
  toDomain(doc: SurplusItemDocument): SurplusItem {
    const props: SurplusItemProps = {
      companyId: doc.companyId,
      title: doc.title,
      description: doc.description ?? undefined,
      category: doc.category,
      materialType: doc.materialType ?? undefined,
      quantity: doc.quantity ? Number(doc.quantity) : 0,
      blockedQuantity: doc.blockedQuantity ? Number(doc.blockedQuantity) : 0,
      unit: doc.unit,
      minTradeQuantity: doc.minTradeQuantity ? Number(doc.minTradeQuantity) : undefined,
      unitPrice: doc.unitPrice ? Number(doc.unitPrice) : undefined,
      wantedCategories: doc.wantedCategories as unknown as Record<string, unknown> | undefined,
      tradeModes: doc.tradeModes as unknown as Record<string, unknown> | undefined,
      technicalSpecs: doc.technicalSpecs as unknown as Record<string, unknown> | undefined,
      images: doc.images as unknown as string[] | undefined,
      location: doc.location ?? undefined,
      city: (doc.city as PilotCity) ?? undefined,
      status: doc.status as SurplusStatus,
      rejectionReason: doc.rejectionReason ?? undefined,
      approvedBy: doc.approvedBy ?? undefined,
      reactivationCount: doc.reactivationCount ?? 0,
      lastReactivatedAt: doc.lastReactivatedAt ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return SurplusItem.createFrom(props, doc.id);
  }

  toPersistence(domain: SurplusItem): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      companyId: props.companyId,
      title: props.title,
      description: props.description,
      category: props.category,
      materialType: props.materialType,
      quantity: props.quantity,
      blockedQuantity: props.blockedQuantity,
      unit: props.unit,
      minTradeQuantity: props.minTradeQuantity,
      unitPrice: props.unitPrice,
      wantedCategories: props.wantedCategories,
      tradeModes: props.tradeModes,
      technicalSpecs: props.technicalSpecs,
      images: props.images,
      location: props.location,
      city: props.city,
      status: props.status,
      rejectionReason: props.rejectionReason,
      approvedBy: props.approvedBy,
      reactivationCount: props.reactivationCount,
      lastReactivatedAt: props.lastReactivatedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}