// apps/backend/src/modules/catalog/infrastructure/persistence/mappers/brand.mapper.ts

import { Brand, BrandProps } from '../../../domain/entities/brand.entity';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { BrandStatus } from '../../../domain/enums/brand-status.enum';
import { Brand as PrismaBrand } from '@prisma/client';

export class BrandMapper {
  public static toDomain(record: PrismaBrand): Brand {
    const slugResult = Slug.create(record.slug);
    
    const props: BrandProps = {
      name: record.name,
      slug: slugResult.success ? slugResult.data : Slug.fromText(record.slug),
      icon: record.icon || undefined,
      image: record.image || undefined,
      description: record.description || undefined,
      status: record.status as BrandStatus,
      isOfficial: record.isOfficial,
      isPopular: record.isPopular,
      order: record.order,
      vendorId: record.vendorId || undefined,
      rejectionReason: record.rejectionReason || undefined,
      approvedAt: record.approvedAt || undefined,
    };

    return Brand.fromPersistence(props, record.id);
  }

  public static toPersistence(domain: Brand): any {
    const props = domain.getProps();
    
    return {
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
      updatedAt: new Date(),
    };
  }
}
