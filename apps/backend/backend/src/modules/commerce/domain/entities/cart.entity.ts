// apps/backend/src/modules/commerce/domain/entities/cart.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { CartItem } from './cart-item.entity';

export interface CartProps {
  userId: string;
  items: CartItem[];
}

export class Cart extends AggregateRoot<CartProps> {
  protected constructor(props: CartProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: CartProps, id: string): Cart {
    return new Cart(props, id);
  }

  public static create(userId: string): Cart {
    return new Cart({
      userId,
      items: [],
    });
  }

  public addItem(listingId: string, quantity: number, variantId?: string): void {
    const existingItem = this.props.items.find(
      (item) => item.getProps().listingId === listingId && item.getProps().variantId === variantId
    );

    if (existingItem) {
      existingItem.updateQuantity(existingItem.getProps().quantity + quantity);
    } else {
      this.props.items.push(CartItem.create(this.id, listingId, quantity, variantId));
    }
    this._updatedAt = new Date();
  }

  public removeItem(itemId: string): void {
    this.props.items = this.props.items.filter((item) => item.id !== itemId);
    this._updatedAt = new Date();
  }

  public clear(): void {
    this.props.items = [];
    this._updatedAt = new Date();
  }

  get userId(): string { return this.props.userId; }
  get items(): CartItem[] { return this.props.items; }
}
