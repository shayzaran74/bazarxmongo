// apps/backend/src/modules/vendor/infrastructure/persistence/mappers/vendor.mapper.ts
// VendorMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { IVendor } from '../../../../../../../../packages/shared/shared-persistence/src/schemas/backend/vendor.schema';
import { Vendor, VendorProps } from '../../../domain/entities/vendor.entity';
import { VendorSlug } from '../../../domain/value-objects/vendor-slug.vo';
import { VendorStatus } from '../../../domain/enums/vendor-status.enum';
import { VendorTier } from '../../../domain/enums/vendor-tier.enum';
import { VendorType } from '../../../domain/enums/vendor-type.enum';

export interface VendorDocument extends IVendor {
  _id?: string;
}

export class VendorMapper {
  public static toDomain(doc: VendorDocument): Vendor {
    const slugResult = VendorSlug.create(doc.slug);
    if (!slugResult.success) {
      throw slugResult.error;
    }

    const props: VendorProps = {
      userId:           doc.userId,
      companyId:        doc.companyId,
      status:           doc.status as VendorStatus,
      tier:             doc.tier as VendorTier,
      vendorType:       doc.vendorType as VendorType,
      slug:             slugResult.data,
      isVerified:       doc.isVerified,
      rejectionReason:  doc.rejectionReason ?? undefined,
      suspensionReason: doc.suspensionReason ?? undefined,
      ecosystemId:      doc.ecosystemId ?? undefined,
      membershipTierId: doc.membershipTierId ?? undefined,
      lastAuditAt:      doc.lastAuditAt ?? undefined,
      verifiedAt:       doc.verifiedAt ?? undefined,
      profile: undefined, // profile ayrı collection'da, populate gerektirir
    };

    return Vendor.fromPersistence(props, doc.id);
  }

  public static toPersistence(vendor: Vendor): Record<string, unknown> {
    const props = vendor.getProps();
    return {
      _id: vendor.id,
      id: vendor.id,
      userId: props.userId,
      companyId: props.companyId,
      status: props.status,
      tier: props.tier,
      vendorType: props.vendorType,
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