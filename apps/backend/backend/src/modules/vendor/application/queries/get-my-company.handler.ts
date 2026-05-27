import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyCompanyQuery } from './get-my-company.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';

@QueryHandler(GetMyCompanyQuery)
export class GetMyCompanyHandler
  implements IQueryHandler<GetMyCompanyQuery> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
  ) {}

  async execute(query: GetMyCompanyQuery) {
    const { userId, userRole } = query;

    const vendor = await this.vendorRepository.findByUserId(userId);

    if (!vendor) {
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        return { isSystemAdmin: true, companyId: null };
      }
      return null;
    }

    const props = vendor.getProps();
    return {
      isVendor: true,
      isSystemAdmin: false,
      companyId: props.companyId ?? null,
      vendorId: vendor.id,
      name: (props as unknown as Record<string, unknown>)['businessName'] as string | undefined,
    };
  }
}