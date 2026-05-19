// apps/backend/src/modules/catalog/infrastructure/persistence/mappers/brand.mapper.ts
// BrandMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { IBrand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';
import { Brand, BrandProps } from '../../../domain/entities/brand.entity';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { BrandStatus } from '../../../domain/enums/brand-status.enum';

export interface BrandDocument extends IBrand {
  _id?: string;
}

export class BrandMapper {
  public static toDomain(doc: BrandDocument): Brand {
    const slugResult = Slug.create(doc.slug);

    const props: BrandProps = {
      name: doc.name,
      slug: slugResult.success ? slugResult.data : Slug.fromText(doc.slug),
      icon: doc.icon ?? undefined,
      image: doc.image ?? undefined,
      description: doc.description ?? undefined,
      status: (doc as any).status as BrandStatus ?? BrandStatus.PENDING,
      isOfficial: doc.isOfficial,
      isPopular: doc.isPopular,
      order: doc.order,
      vendorId: doc.vendorId ?? undefined,
      rejectionReason: doc.rejectionReason ?? undefined,
      approvedAt: doc.approvedAt ?? undefined,
    };

    return Brand.fromPersistence(props, doc.id);
  }

  public static toPersistence(domain: Brand): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      name: props.name,
      slug: props.slug.value,
      icon: props.icon,
      image: props.image,
      description: props.description,
      status: props.status,
      isOfficial: props.isOfficial,
      isPopular: props.isPopular,
      order: props.order,
      vendorId: props.vendorId,
      rejectionReason: props.rejectionReason,
      approvedAt: props.approvedAt,
    };
  }
}