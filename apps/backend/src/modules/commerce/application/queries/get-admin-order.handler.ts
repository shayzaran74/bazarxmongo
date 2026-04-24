// apps/backend/src/modules/commerce/application/queries/get-admin-order.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminOrderQuery } from './get-admin-order.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@QueryHandler(GetAdminOrderQuery)
export class GetAdminOrderHandler implements IQueryHandler<GetAdminOrderQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAdminOrderQuery) {
    const { orderId } = query;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            listing: {
              include: {
                catalogProduct: true,
                vendor: {
                  include: { company: true }
                }
              }
            }
          }
        },
        statusHistory: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        vendor: {
          include: {
            company: {
              select: {
                name: true,
                taxNumber: true,
                taxOffice: true,
              }
            }
          }
        },
        invoices: true,
      }
    });

    if (!order) return null;

    // TypeScript tip kontrolünü aşmak için 'any' cast kullanıyoruz
    const rawOrder = order as any;

    return {
      ...rawOrder,
      User: rawOrder.user,
      OrderItem: rawOrder.orderItems?.map((item: any) => ({
        ...item,
        Product: item.listing?.catalogProduct ? {
          ...item.listing.catalogProduct,
          Vendor: item.listing.vendor
        } : null
      }))
    };
  }
}
