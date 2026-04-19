// apps/backend/src/modules/vendor/infrastructure/persistence/mappers/vendor.mapper.ts

import { Vendor, VendorProps } from '../../../domain/entities/vendor.entity';
import { VendorSlug } from '../../../domain/value-objects/vendor-slug.vo';
import { VendorStatus } from '../../../domain/enums/vendor-status.enum';
import { VendorTier } from '../../../domain/enums/vendor-tier.enum';

export class VendorMapper {
  public static toDomain(record: any): Vendor {
    const slugResult = VendorSlug.create(record.slug);
    if (!slugResult.success) {
      throw (slugResult as any).error;
    }

    const slug = slugResult.data;

    const props: VendorProps = {
      userId: record.userId,
      companyId: record.companyId,
      status: record.status as VendorStatus,
      tier: record.tier as VendorTier,
      slug: slug,
      isVerified: record.isVerified,
      rejectionReason: record.rejectionReason,
      suspensionReason: record.suspensionReason,
      ecosystemId: record.ecosystemId,
      membershipTierId: record.membershipTierId,
      lastAuditAt: record.lastAuditAt,
      verifiedAt: record.verifiedAt,
    };

    return Vendor.fromPersistence(props, record.id);
  }

  public static toPersistence(vendor: Vendor): any {
    const props = vendor.getProps();
    return {
      id: vendor.id,
      userId: props.userId,
      companyId: props.companyId,
      status: props.status,
      tier: props.tier,
      slug: props.slug.value,
      isVerified: props.isVerified,
      rejectionReason: props.rejectionReason,
      suspensionReason: props.suspensionReason,
      ecosystemId: props.ecosystemId,
      membershipTierId: props.membershipTierId,
      lastAuditAt: props.lastAuditAt,
      verifiedAt: props.verifiedAt,
    };
  }
}
