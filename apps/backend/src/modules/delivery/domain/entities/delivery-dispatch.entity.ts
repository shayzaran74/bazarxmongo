// apps/backend/src/modules/delivery/domain/entities/delivery-dispatch.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { DispatchStatus } from '../enums/dispatch-status.enum';

export interface DeliveryDispatchProps {
  orderId: string;
  courierId?: string;
  status: DispatchStatus;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
}

const VALID_TRANSITIONS: Record<DispatchStatus, DispatchStatus[]> = {
  [DispatchStatus.PENDING_ASSIGN]: [DispatchStatus.ASSIGNED, DispatchStatus.CANCELLED],
  [DispatchStatus.ASSIGNED]:      [DispatchStatus.PICKED_UP, DispatchStatus.CANCELLED],
  [DispatchStatus.PICKED_UP]:     [DispatchStatus.DELIVERED],
  [DispatchStatus.DELIVERED]:     [],
  [DispatchStatus.CANCELLED]:     [],
};

export class DeliveryDispatch extends AggregateRoot<DeliveryDispatchProps> {
  protected constructor(props: DeliveryDispatchProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: DeliveryDispatchProps, id: string): DeliveryDispatch {
    return new DeliveryDispatch(props, id);
  }

  public static create(orderId: string): DeliveryDispatch {
    return new DeliveryDispatch({
      orderId,
      status: DispatchStatus.PENDING_ASSIGN,
    });
  }

  public transitionTo(newStatus: DispatchStatus): void {
    const allowed = VALID_TRANSITIONS[this.props.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new DomainException(
        `Invalid dispatch transition: ${this.props.status} → ${newStatus}`,
      );
    }
    this.props.status = newStatus;
    this._updatedAt = new Date();
  }

  public assignCourier(courierId: string): void {
    if (this.props.status !== DispatchStatus.PENDING_ASSIGN) {
      throw new DomainException('Sipariş henüz kurye ataması bekliyor değil.');
    }
    this.props.courierId = courierId;
    this.transitionTo(DispatchStatus.ASSIGNED);
  }

  public markPickedUp(): void {
    if (this.props.status !== DispatchStatus.ASSIGNED) {
      throw new DomainException('Sadece ASSIGNED durumdan PICKED_UP yapılabilir.');
    }
    this.props.pickedUpAt = new Date();
    this.transitionTo(DispatchStatus.PICKED_UP);
  }

  public markDelivered(): void {
    if (this.props.status !== DispatchStatus.PICKED_UP) {
      throw new DomainException('Sadece PICKED_UP durumdan DELIVERED yapılabilir.');
    }
    this.props.deliveredAt = new Date();
    this.transitionTo(DispatchStatus.DELIVERED);
  }

  public cancel(): void {
    if ([DispatchStatus.PICKED_UP, DispatchStatus.DELIVERED].includes(this.props.status)) {
      throw new DomainException('Teslim alınmış veya teslim edilmiş sipariş iptal edilemez.');
    }
    this.transitionTo(DispatchStatus.CANCELLED);
  }

  get orderId(): string { return this.props.orderId; }
  get courierId(): string | undefined { return this.props.courierId; }
  get status(): DispatchStatus { return this.props.status; }
  get deliveredAt(): Date | undefined { return this.props.deliveredAt; }

  // Public snapshot for infrastructure layer (avoids protected props access)
  toSnapshot(): DeliveryDispatchProps & { id?: string } {
    return { ...this.props, id: this.id };
  }
}