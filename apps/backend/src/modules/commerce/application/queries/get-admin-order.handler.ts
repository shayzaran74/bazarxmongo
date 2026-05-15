// apps/backend/src/modules/commerce/application/queries/get-admin-order.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetAdminOrderQuery } from './get-admin-order.query';

// Prisma payload tipi — include yapısı
type AdminOrderPayload = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        listing: {
          include: {
            catalogProduct: true;
            vendor: { include: { company: true } };
          };
        };
      };
    };
    statusHistory: true;
    user: {
      select: {
        id: true;
        email: true;
        profile: { select: { firstName: true; lastName: true } };
      };
    };
    vendor: {
      include: {
        company: { select: { name: true; taxNumber: true; taxOffice: true } };
      };
    };
    invoices: true;
  };
}>;

@QueryHandler(GetAdminOrderQuery)
export class GetAdminOrderHandler implements IQueryHandler<GetAdminOrderQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAdminOrderQuery) {
    const { orderId } = query;

    const order = (await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            listing: {
              include: {
                catalogProduct: true,
                vendor: { include: { company: true } },
              },
            },
          },
        },
        statusHistory: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        vendor: {
          include: {
            company: {
              select: { name: true, taxNumber: true, taxOffice: true },
            },
          },
        },
        invoices: true,
      },
    })) as AdminOrderPayload | null;

    if (!order) return null;

    // Frontend uyumlu mapping (PascalCase alias'lar)
    return {
      ...order,
      User: order.user,
      OrderItem: order.orderItems.map((item) => ({
        ...item,
        Product: item.listing?.catalogProduct
          ? {
              ...item.listing.catalogProduct,
              Vendor: item.listing.vendor,
            }
          : null,
      })),
    };
  }
}
