// apps/backend/src/modules/vendor/application/queries/get-vendor-users.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetVendorUsersQuery } from './get-vendor-users.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IdentityPublicService } from '@barterborsa/domain-identity';

@QueryHandler(GetVendorUsersQuery)
export class GetVendorUsersHandler implements IQueryHandler<GetVendorUsersQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly identityPublic: IdentityPublicService,
  ) {}

  async execute(query: GetVendorUsersQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) return [];

    const vendorProps = vendor.getProps();
    const companyId = vendorProps.companyId;
    if (!companyId) return [];

    const vendorUserId = vendorProps.userId ?? '';
    const user = await this.identityPublic.getUserById(vendorUserId);
    if (!user) return [];

    return [{
      id:          vendorUserId,
      email:       user.email,
      role:        user.role,
      companyRole: 'OWNER',
    }];
  }
}
