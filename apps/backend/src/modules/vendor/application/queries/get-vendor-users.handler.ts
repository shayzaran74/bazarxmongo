import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetVendorUsersQuery } from './get-vendor-users.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IUserRepository } from '../../../identity/domain/repositories/user.repository.interface';

@QueryHandler(GetVendorUsersQuery)
export class GetVendorUsersHandler implements IQueryHandler<GetVendorUsersQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(query: GetVendorUsersQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) return [];

    const vendorProps = vendor.getProps();
    const companyId = vendorProps.companyId;
    if (!companyId) return [];

    const vendorUserId = vendorProps.userId;
    const user = await this.userRepo.findById(vendorUserId ?? '');
    if (!user) return [];

    const userProps = (user as unknown as { getProps?(): Record<string, unknown> }).getProps?.() ?? user as unknown as Record<string, unknown>;
    return [{
      id:         vendorUserId ?? user.id,
      email:      (userProps.email as string) || user.id,
      role:       (userProps.role as string) || 'VENDOR',
      companyRole: 'OWNER',
    }];
  }
}
