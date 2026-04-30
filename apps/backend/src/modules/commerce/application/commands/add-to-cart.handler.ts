import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AddToCartCommand } from './add-to-cart.command';

@CommandHandler(AddToCartCommand)
export class AddToCartHandler implements ICommandHandler<AddToCartCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddToCartCommand) {
    const { userId, productId, quantity } = command;
    let { listingId } = command;

    // Sepet oluştur veya getir
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // productId varsa listing bul
    if (!listingId && productId) {
      const listing = await this.prisma.listing.findFirst({
        where: { catalogProductId: productId, status: 'ACTIVE' },
      });
      if (!listing) {
        throw new BadRequestException('İlan bulunamadı');
      }
      listingId = listing.id;
    }

    if (!listingId) {
      throw new BadRequestException('Geçersiz ürün bilgisi');
    }

    // Stok ve durum doğrulama - aktif olmayan veya yetersiz stoktaki ürünler sepete eklenemez
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { status: true, availableQuantity: true, title: true },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      throw new BadRequestException('İlan aktif değil veya bulunamadı');
    }

    // Sepetteki mevcut miktarı da hesaba kat
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, listingId },
    });
    const currentCartQty = existingItem?.quantity ?? 0;
    const totalRequested = currentCartQty + quantity;

    if (listing.availableQuantity < totalRequested) {
      throw new BadRequestException(
        `"${listing.title}" için yeterli stok bulunmamaktadır (mevcut: ${listing.availableQuantity})`,
      );
    }

    // Mevcut item varsa quantity artır, yoksa ekle
    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: totalRequested },
      });
    } else {
      await this.prisma.cartItem.create({
        data: { cartId: cart.id, listingId, quantity },
      });
    }

    return { success: true, message: 'Ürün sepete eklendi' };
  }
}
