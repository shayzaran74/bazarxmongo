// apps/backend/src/modules/inventory/domain/entities/stock.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface StockProps {
  listingId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
}

export class Stock extends AggregateRoot<StockProps> {
  protected constructor(props: StockProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: StockProps, id: string): Stock {
    return new Stock(props, id);
  }

  public static create(listingId: string, warehouseId: string): Stock {
    return new Stock({
      listingId,
      warehouseId,
      quantity: 0,
      reservedQuantity: 0,
    });
  }

  public addQuantity(amount: number): void {
    this.props.quantity += amount;
    this._updatedAt = new Date();
  }

  public removeQuantity(amount: number): boolean {
    if (this.props.quantity - this.props.reservedQuantity < amount) {
      return false;
    }
    this.props.quantity -= amount;
    this._updatedAt = new Date();
    return true;
  }

  get availableQuantity(): number {
    return this.props.quantity - this.props.reservedQuantity;
  }
}
