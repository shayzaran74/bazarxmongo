import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { GetVendorOrdersQuery } from './get-vendor-orders.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IOrderRepository } from '../../../commerce/domain/repositories/order.repository.interface';
import { IUserRepository } from '../../../identity/domain/repositories/user.repository.interface';
import { OrderMapper } from '../../../commerce/infrastructure/persistence/mappers/order.mapper';
import { Order } from '../../../commerce/domain/entities/order.entity';
import { ShippingAddressProps } from '../../../commerce/domain/value-objects/shipping-address.vo';

interface UserSummary {
  id: string;
  email: string;
  profile?: { firstName: string; lastName: string };
}

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

    const vendorId = vendor.id;

    const result = await this.orderRepo.findAllFiltered({ vendorId, status, skip, limit });
    const total = result.total;

    const items = await Promise.all(result.items.map(async (order: Order) => {
      const p = OrderMapper.toResponse(order);
      await OrderMapper.populateImages(p);

      let user: UserSummary | null = null;
      if (p.userId) {
        try {
          const userDoc = await this.userRepo.findById(p.userId as string);
          if (userDoc) {
            user = {
              id: userDoc.id,
              email: userDoc.email,
              profile: (userDoc.profile as { firstName: string; lastName: string } | undefined)
                ?? { firstName: 'İsimsiz', lastName: '' },
            };
          }
        } catch {
          // ignore
        }
      }

      const shippingAddr = p.shippingAddress as ShippingAddressProps | undefined;
      const fullName = shippingAddr
        ? `${shippingAddr.firstName} ${shippingAddr.lastName}`.trim()
        : user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'İsimsiz';

      return {
        ...p,
        user,
        address: shippingAddr ? {
          fullName,
          addressLine: shippingAddr.addressLine1 || '',
          district:    shippingAddr.district || '',
          city:        shippingAddr.city || '',
        } : null,
      };
    }));

    return { items, total, page, limit };
  }
}
