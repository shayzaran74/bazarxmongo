import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetCartQuery } from './get-cart.query';

@QueryHandler(GetCartQuery)
export class GetCartHandler implements IQueryHandler<GetCartQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCartQuery) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: query.userId },
      include: {
        items: {
          include: {
            listing: {
              include: {
                catalogProduct: {
                  include: {
                    media: { orderBy: { sortOrder: 'asc' } },
                    brands: true
                  }
                },
                vendor: { include: { company: true } }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      return {
        items: [],
        summary: { total: 0, subtotal: 0, tax: 0, shipping: 0 }
      };
    }

    let total = 0;
    const items = cart.items.map(item => {
      const price = Number(item.listing.price);
      total += price * item.quantity;
      return {
        id: item.id,
        productId: item.listing.catalogProduct.id,
        listingId: item.listingId,
        quantity: item.quantity,
        price,
        Product: {
          id: item.listing.catalogProduct.id,
          name: item.listing.catalogProduct.name,
          slug: item.listing.catalogProduct.slug,
          image: item.listing.catalogProduct.media?.[0]?.url ?? null,
          Brand: item.listing.catalogProduct.brands?.[0] ?? null,
          stock: item.listing.stock,
          price
        },
        vendor: {
          id: item.listing.vendor.id,
          businessName: item.listing.vendor.company?.name || 'Unknown',
          merchantType: item.listing.vendor.company?.companyType || 'INDIVIDUAL'
        }
      };
    });

    return {
      items,
      summary: { total, subtotal: total, tax: 0, shipping: 0 }
    };
  }
}
