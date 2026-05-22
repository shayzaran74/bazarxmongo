import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetEcosystemAuditLogsQuery } from './get-ecosystem-audit-logs.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { BrandEcosystem } from '@barterborsa/shared-persistence/schemas/backend/brandEcosystem.schema';
import { EcosystemAuditLog } from '@barterborsa/shared-persistence/schemas/backend/ecosystemAuditLog.schema';

@QueryHandler(GetEcosystemAuditLogsQuery)
export class GetEcosystemAuditLogsHandler
  implements IQueryHandler<GetEcosystemAuditLogsQuery> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
  ) {}

  async execute(query: GetEcosystemAuditLogsQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) return [];

    const vendorId = vendor.id;

    // brandEcosystem ilişkisi MongoDB'de nasıl tutuluyor bilmiyoruz
    // doğrudan BrandEcosystem tablosundan ownerId ile çek
    const ecosystem = await BrandEcosystem.findOne({ ownerId: vendorId }).exec();
    if (!ecosystem) return [];

    const logs = await EcosystemAuditLog.find({ ecosystemId: ecosystem.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    return logs.map(doc => doc.toObject());
  }
}
