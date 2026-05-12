// apps/backend/src/modules/vendor/infrastructure/persistence/mappers/vendor.mapper.ts

import type { Prisma, Vendor as VendorRecord } from '@prisma/client';
import { Vendor, VendorProps } from '../../../domain/entities/vendor.entity';
import { VendorSlug } from '../../../domain/value-objects/vendor-slug.vo';
import { VendorStatus } from '../../../domain/enums/vendor-status.enum';
import { VendorTier } from '../../../domain/enums/vendor-tier.enum';
import { VendorType } from '../../../domain/enums/vendor-type.enum';

export class VendorMapper {
  public static toDomain(record: VendorRecord): Vendor {
    const slugResult = VendorSlug.create(record.slug);
    if (!slugResult.success) {
      throw slugResult.error;
    }

    const slug = slugResult.data;

    const props: VendorProps = {
      userId:           record.userId,
      companyId:        record.companyId,
      status:           record.status as VendorStatus,
      tier:             record.tier as VendorTier,
      vendorType:       record.vendorType as VendorType,
      slug:             slug,
      isVerified:       record.isVerified,
      rejectionReason:  record.rejectionReason ?? undefined,
      suspensionReason: record.suspensionReason ?? undefined,
      ecosystemId:      record.ecosystemId ?? undefined,
      membershipTierId: record.membershipTierId ?? undefined,
      lastAuditAt:      record.lastAuditAt ?? undefined,
      verifiedAt:       record.verifiedAt ?? undefined,
      profile: (record as any).profile ? {
        storeName: (record as any).profile.storeName,
        description: (record as any).profile.description,
        city: (record as any).profile.city,
        cuisineType: (record as any).profile.cuisineType,
        rating: (record as any).profile.rating,
        reviewCount: (record as any).profile.reviewCount,
        avgPrepTimeMinutes: (record as any).profile.avgPrepTimeMinutes,
        minOrderAmount: (record as any).profile.minOrderAmount,
        deliveryRadius: (record as any).profile.deliveryRadius,
        isFeatured: (record as any).profile.isFeatured,
        imageUrl: (record as any).profile.imageUrl,
      } : undefined,
    };

    return Vendor.fromPersistence(props, record.id);
  }

  public static toPersistence(vendor: Vendor): Prisma.VendorUncheckedCreateInput {
    const props = vendor.getProps();
    return {
      id:               vendor.id,
      userId:           props.userId,
      companyId:        props.companyId,
      status:           props.status,
      tier:             props.tier,
      vendorType:       props.vendorType,
      slug:             props.slug.value,
      isVerified:       props.isVerified,
      rejectionReason:  props.rejectionReason,
      suspensionReason: props.suspensionReason,
      ecosystemId:      props.ecosystemId,
      membershipTierId: props.membershipTierId,
      lastAuditAt:      props.lastAuditAt,
      verifiedAt:       props.verifiedAt,
    };
  }
}
