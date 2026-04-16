// apps/backend/src/modules/inventory/domain/entities/warehouse.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface WarehouseProps {
  vendorId: string;
  name: string;
  address?: string;
  city?: string;
  isDefault: boolean;
  isActive: boolean;
}

export class Warehouse extends AggregateRoot<WarehouseProps> {
  protected constructor(props: WarehouseProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: WarehouseProps, id: string): Warehouse {
    return new Warehouse(props, id);
  }

  public static create(props: Omit<WarehouseProps, 'isActive'>): Warehouse {
    return new Warehouse({
      ...props,
      isActive: true,
    });
  }

  get vendorId(): string { return this.props.vendorId; }
  get name(): string { return this.props.name; }
}
