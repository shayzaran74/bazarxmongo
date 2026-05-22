import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { GetVendorPendingOrderCountQuery }
  from './get-vendor-pending-order-count.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IOrderRepository } from '../../../commerce/domain/repositories/order.repository.interface';

@QueryHandler(GetVendorPendingOrderCountQuery)
export class GetVendorPendingOrderCountHandler
  implements IQueryHandler<GetVendorPendingOrderCountQuery> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(query: GetVendorPendingOrderCountQuery) {
    const vendor = await this.vendorRepo.findByUserId(query.userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const vendorId = vendor.id;

    const result = await this.orderRepo.findAllFiltered({ vendorId, status: 'PENDING', limit: 0 });
    return result.total;
  }
}
