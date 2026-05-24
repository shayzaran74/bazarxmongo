// apps/backend/src/modules/vendor/application/queries/get-my-ecosystem.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyEcosystemQuery } from './get-my-ecosystem.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';
import { IEcosystemMembershipRepository } from '../../domain/repositories/i-ecosystem-membership.repository';
import { ECOSYSTEM_MEMBERSHIP_LIMITS } from '../../domain/constants/ecosystem.constants';

@QueryHandler(GetMyEcosystemQuery)
export class GetMyEcosystemHandler implements IQueryHandler<GetMyEcosystemQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
    @Inject('IEcosystemMembershipRepository')
    private readonly membershipRepo: IEcosystemMembershipRepository,
  ) {}

  async execute(query: GetMyEcosystemQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) return null;

    const vendorProps = vendor.getProps();
    const vendorId = vendor.id;

    // Kurucu olarak ekosistemi var mı?
    const owned = await this.ecosystemRepo.findByOwnerId(vendorId);
    const isApexPlus = vendorProps.tier === 'APEX';

    // Üye olduğu tüm aktif ecosystem'leri bul
    const activeMemberships = await this.membershipRepo.findActiveByDealerId(vendorId);

    // Her bir ecosystem bilgisini çek
    const membershipDetails = await Promise.all(
      activeMemberships.map(async (m) => {
        const ecosystem = await this.ecosystemRepo.findById(m.ecosystemId);
        return {
          ecosystem: ecosystem || null,
          status: m.status as 'ACTIVE',
          joinedAt: m.joinedAt,
        };
      }),
    );

    const validMemberships = membershipDetails.filter((m) => m.ecosystem !== null);
    const membershipCount = validMemberships.length;
    const membershipLimit = ECOSYSTEM_MEMBERSHIP_LIMITS[vendorProps.tier] ?? 0;
    const canJoinMore = membershipCount < membershipLimit;

    return {
      isOwner: !!owned,
      ownedEcosystem: owned || null,
      memberships: validMemberships,
      membershipCount,
      membershipLimit,
      canJoinMore,
      isApexPlus,
    };
  }
}