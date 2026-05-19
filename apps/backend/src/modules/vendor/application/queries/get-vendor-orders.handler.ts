import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { GetVendorOrdersQuery } from './get-vendor-orders.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IOrderRepository } from '../../../commerce/domain/repositories/order.repository.interface';
import { IUserRepository } from '../../../identity/domain/repositories/user.repository.interface';
import { OrderMapper } from '../../../commerce/infrastructure/persistence/mappers/order.mapper';

@QueryHandler(GetVendorOrdersQuery)
export class GetVendorOrdersHandler
  implements IQueryHandler<GetVendorOrdersQuery> {

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(query: GetVendorOrdersQuery) {
    const { userId, filters } = query;
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const vendorProps = vendor.getProps();
    const vendorId = (vendorProps as any).id || vendor.id;

    const result = await this.orderRepo.findAllFiltered({ vendorId, status, skip, limit });
    const total = result.total;

    const items = await Promise.all(result.items.map(async (order: any) => {
      const p = OrderMapper.toResponse(order);
      await OrderMapper.populateImages(p);
      
      let user: any = null;
      if (p.userId) {
        try {
          const userDoc = await this.userRepo.findById(p.userId as string);
          if (userDoc) {
            user = {
              id: userDoc.id,
              email: userDoc.email,
              profile: userDoc.profile || { firstName: 'İsimsiz', lastName: '' }
            };
          }
        } catch (e) {
          // ignore
        }
      }

      return {
        ...p,
        user,
        address: p.shippingAddress ? {
          fullName: (p.shippingAddress as any).fullName || (user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'İsimsiz'),
          addressLine: (p.shippingAddress as any).addressLine || '',
          district: (p.shippingAddress as any).district || '',
          city: (p.shippingAddress as any).city || '',
        } : null,
      };
    }));

    return { items, total, page, limit };
  }
}
