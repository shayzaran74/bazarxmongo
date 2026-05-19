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
    const companyId = (vendorProps as any).companyId;
    if (!companyId) return [];

    // MongoDB'de Company.users ilişkisi farklı yapıda olabilir
    // Basitleştirilmiş versiyon: sadece vendor'ın kendi userId'sini döndür
    const vendorUserId = (vendorProps as any).userId;
    const user = await this.userRepo.findById(vendorUserId);
    if (!user) return [];

    const userProps = user.getProps ? user.getProps() : user;
    return [{
      id:         vendorUserId,
      email:      (userProps as any).email || user.id,
      role:       (userProps as any).role || 'VENDOR',
      companyRole: 'OWNER',
    }];
  }
}
