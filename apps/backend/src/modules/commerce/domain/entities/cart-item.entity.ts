// apps/backend/src/modules/commerce/domain/entities/cart-item.entity.ts

import { Entity, DomainException } from '@barterborsa/shared-core';

export interface CartItemProps {
  cartId: string;
  listingId: string;
  quantity: number;
  variantId?: string;
  addedAt: Date;
}

export class CartItem extends Entity<CartItemProps> {
  protected constructor(props: CartItemProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: CartItemProps, id: string): CartItem {
    return new CartItem(props, id);
  }

  public static create(cartId: string, listingId: string, quantity: number, variantId?: string): CartItem {
    if (quantity <= 0) {
      throw new DomainException('Quantity must be greater than zero');
    }
    return new CartItem({
      cartId,
      listingId,
      quantity,
      variantId,
      addedAt: new Date(),
    });
  }

  public updateQuantity(newQty: number): void {
    if (newQty <= 0) {
      throw new DomainException('Quantity must be greater than zero');
    }
    this.props.quantity = newQty;
  }
}
