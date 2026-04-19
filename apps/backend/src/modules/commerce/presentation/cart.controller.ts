import { Controller, Post, Body, Get, UseGuards, Put, Delete, Param, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { AddToCartDto } from '../application/dtos/add-to-cart.dto';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, Public } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService
  ) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }
    return cart;
  }

  @ApiOperation({ summary: 'Add product to cart' })
  @ApiBody({ type: AddToCartDto })
  @Post()
  @UseGuards(JwtAuthGuard)
  async addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(user.id);
    
    // Fallback: listingId is primarily used, but if frontend sends productId, we find its listing.
    let listingId = dto.listingId;
    if (!listingId && dto.productId) {
      const listing = await this.prisma.listing.findFirst({
        where: { catalogProductId: dto.productId, status: 'ACTIVE' }
      });
      if (!listing) return { success: false, error: 'İlan bulunamadı', data: null };
      listingId = listing.id;
    }

    if (!listingId) return { success: false, error: 'Geçersiz ürün bilgisi', data: null };

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, listingId }
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity }
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, listingId, quantity: dto.quantity }
      });
    }

    return { success: true, message: 'Ürün sepete eklendi' };
  }

  @ApiOperation({ summary: 'Get current cart' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@CurrentUser() user: any) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            listing: {
              include: {
                catalogProduct: { include: { media: { orderBy: { sortOrder: 'asc' } }, brands: true } },
                vendor: { include: { company: true } }
              }
            }
          }
        }
      }
    });

    if (!cart) return { success: true, data: { items: [], summary: { total: 0, subtotal: 0, tax: 0, shipping: 0 } } };

    let total = 0;
    const items = cart.items.map(item => {
      const price = Number(item.listing.price);
      total += price * item.quantity;
      return {
        id: item.id,
        productId: item.listing.catalogProduct.id,
        listingId: item.listingId,
        quantity: item.quantity,
        price: price,
        Product: {
          id: item.listing.catalogProduct.id,
          name: item.listing.catalogProduct.name,
          slug: item.listing.catalogProduct.slug,
          image: item.listing.catalogProduct.media?.[0]?.url || null,
          Brand: item.listing.catalogProduct.brands?.[0] || null,
          stock: item.listing.stock,
          price: price
        },
        vendor: {
          id: item.listing.vendor.id,
          businessName: item.listing.vendor.company.name,
          merchantType: item.listing.vendor.company.companyType
        }
      };
    });

    return { 
      success: true, 
      data: { 
        items, 
        summary: { total, subtotal: total, tax: 0, shipping: 0 } 
      } 
    };
  }

  @ApiOperation({ summary: 'Update cart item quantity' })
  @Patch(':itemId')
  @Put(':itemId')
  @UseGuards(JwtAuthGuard)
  async updateQuantity(@Param('itemId') itemId: string, @Body('quantity') quantity: number) {
    if (quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      });
    }
    return { success: true, message: 'Sepet güncellendi' };
  }

  @ApiOperation({ summary: 'Remove item from cart' })
  @Delete(':itemId')
  @UseGuards(JwtAuthGuard)
  async removeItem(@Param('itemId') itemId: string) {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { success: true, message: 'Ürün sepetten silindi' };
  }

  @ApiOperation({ summary: 'Clear entire cart' })
  @Delete()
  @UseGuards(JwtAuthGuard)
  async clearCart(@CurrentUser() user: any) {
    const cart = await this.prisma.cart.findUnique({ where: { userId: user.id } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { success: true, message: 'Sepet temizlendi' };
  }

  @Public()
  @ApiOperation({ summary: 'Get available escrow coupons' })
  @Get('escrow-coupons')
  async getEscrowCoupons() {
    return { success: true, data: [] };
  }
}
