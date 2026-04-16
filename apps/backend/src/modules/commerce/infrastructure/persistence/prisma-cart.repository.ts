// apps/backend/src/modules/commerce/infrastructure/persistence/prisma-cart.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ICartRepository } from '../../domain/repositories/cart.repository.interface';
import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/entities/cart-item.entity';

@Injectable()
export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Cart | null> {
    const record = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!record) return null;

    const items = record.items.map((item) =>
      CartItem.fromPersistence(
        {
          cartId: item.cartId,
          listingId: item.listingId,
          quantity: item.quantity,
          variantId: item.variantId || undefined,
          addedAt: item.addedAt,
        },
        item.id
      )
    );

    return Cart.fromPersistence({ userId: record.userId, items }, record.id);
  }

  async save(cart: Cart): Promise<void> {
    const props = cart.getProps();
    await this.prisma.cart.upsert({
      where: { userId: props.userId },
      create: {
        id: cart.id,
        userId: props.userId,
        items: {
          create: props.items.map((item) => ({
            id: item.id,
            listingId: item.getProps().listingId,
            quantity: item.getProps().quantity,
            variantId: item.getProps().variantId,
          })),
        },
      },
      update: {
        items: {
          deleteMany: {},
          create: props.items.map((item) => ({
            id: item.id,
            listingId: item.getProps().listingId,
            quantity: item.getProps().quantity,
            variantId: item.getProps().variantId,
          })),
        },
      },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.cart.delete({ where: { userId } });
  }
}
