import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyEcosystemQuery } from './get-my-ecosystem.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';

@QueryHandler(GetMyEcosystemQuery)
export class GetMyEcosystemHandler
  implements IQueryHandler<GetMyEcosystemQuery> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
  ) {}

  async execute(query: GetMyEcosystemQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) return null;

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    // Kurucu olarak ekosistemi var mı?
    const owned = await this.ecosystemRepo.findByOwnerId(vendorId);
    // Üye olarak ekosisteme dahil mi?
    const memberOf = await this.ecosystemRepo.findById((vendorProps as any).ecosystemId || '');

    const isApexPlus = (vendorProps as any).tier === 'APEX';

    return {
      isOwner: !!owned,
      ecosystem: owned || (memberOf || null),
      isApexPlus,
    };
  }
}
