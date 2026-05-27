// apps/backend/src/modules/commerce/application/queries/get-admin-order.handler.ts
// GetAdminOrderHandler — Mongoose migration (ADR-005 Faz 2b)

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminOrderQuery } from './get-admin-order.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderMapper } from '../../infrastructure/persistence/mappers/order.mapper';

@QueryHandler(GetAdminOrderQuery)
export class GetAdminOrderHandler implements IQueryHandler<GetAdminOrderQuery> {
  constructor(@Inject('IOrderRepository') private readonly orderRepo: IOrderRepository) {}

  async execute(query: GetAdminOrderQuery) {
    const { orderId } = query;
    const order = await this.orderRepo.findById(orderId);
    if (!order) return null;

    const response = OrderMapper.toResponse(order);
    await OrderMapper.populateImages(response);

    const orderModel = (this.orderRepo as any).model;
    if (orderModel && orderModel.db) {
      try {
        // Fetch User and UserProfile
        const userDoc = await orderModel.db.collection('users').findOne({
          $or: [{ id: response.userId }, { _id: response.userId }]
        });
        if (userDoc) {
          const profileDoc = await orderModel.db.collection('user_profiles').findOne({
            $or: [{ userId: response.userId }, { user_id: response.userId }]
          });
          response.User = {
            id: userDoc.id,
            email: userDoc.email,
            profile: profileDoc ? {
              firstName: profileDoc.firstName || profileDoc.first_name || '',
              lastName: profileDoc.lastName || profileDoc.last_name || '',
            } : null,
          };
        }

        // Fetch Vendor and Company details for items
        const vendorDoc = await orderModel.db.collection('vendors').findOne({ id: response.vendorId });
        let vendorName = 'Mağaza';
        if (vendorDoc) {
          if (vendorDoc.companyId) {
            const companyDoc = await orderModel.db.collection('companies').findOne({ id: vendorDoc.companyId });
            if (companyDoc) {
              vendorName = companyDoc.name || 'Mağaza';
            }
          }
        }

        // Map items for UI compatibility (Prisma PascalCase relations)
        const orderItems = ((response.items as any) || []).map((item: any) => ({
          ...item,
          Product: {
            name: item.productName,
            image: item.productImage,
            sku: item.sku || '',
            Vendor: vendorDoc ? {
              id: response.vendorId,
              businessName: vendorName,
              profile: {
                storeName: vendorDoc.storeName || vendorDoc.store_name || vendorName,
              }
            } : null,
          }
        }));

        response.OrderItem = orderItems;
      } catch (err) {
        // ignore
      }
    }

    return response;
  }
}
